import bcrypt from "bcryptjs";
import "./CredentialsForm.css";
import { useContext, useState } from "react";
import { AuthContext } from "../../AuthContext";
import { TextField } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import OneClickButton from "../lib/OneClickButton";

const createAccountURL =
  "https://5xx9atbspi.execute-api.us-east-2.amazonaws.com/default/createAccount";
const loginURL =
  "https://5xx9atbspi.execute-api.us-east-2.amazonaws.com/default/login";
// const createAccountURL = "http://localhost:3000/createNewAccount";
// const loginURL = "http://localhost:3000/login";


const saltRounds = 10;

interface CredentialsFormProps {
  isLoginForm: boolean;
}

export default function CredentialsForm({ isLoginForm }: CredentialsFormProps) {
  const navigate = useNavigate();

  const { setLoginUser } = useContext(AuthContext);

  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [buttonIsDisabled, setButtonIsDisabled] = useState<boolean>(false);

  function sendCredentials(body: { [key: string]: string }) {
    fetch(isLoginForm ? loginURL : createAccountURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        localStorage.setItem("token", data.token);
        setLoginUser(user);
        setButtonIsDisabled(false);
        navigate("/editor");
      })
      .catch((error) => {
        console.error(error);
        setButtonIsDisabled(false);
      });
  }

  function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setButtonIsDisabled(true);

    const body: {
      [key: string]: string;
    } = {
      username: user,
      password: password,
    };
    if (isLoginForm) {
      sendCredentials(body);
    } else {
      bcrypt.hash(
        body["password"],
        saltRounds,
        function (err: Error | null, hash: string) {
          if (err) return;

          body["password"] = hash;
          sendCredentials(body);
        }
      );
    }
  }

  return (
    <div className="formContainer">
      {isLoginForm && <h2 style={{ marginTop: 0 }}>Sign in</h2>}

      <form id="submitForm" onSubmit={handleSubmit}>
        <TextField
          id="username"
          label="Username"
          variant="outlined"
          onChange={(e) => setUser(e.target.value)}
          required
          fullWidth
        />
        <TextField
          id="password"
          label="Password"
          variant="outlined"
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        <hr id="divider" />

        <OneClickButton
          className="submitButton"
          type="submit"
          buttonIsDisabled={buttonIsDisabled}
          variant="contained"
        >
          {isLoginForm ? "Sign In" : "Create Account"}
        </OneClickButton>
      </form>
      {isLoginForm ? (
        <p style={{ textAlign: "center" }}>
          or create account <Link to="/">here</Link>
        </p>
      ) : (
        <p style={{ textAlign: "center" }}>
          or sign in <Link to="/login">here</Link>
        </p>
      )}
    </div>
  );
}
