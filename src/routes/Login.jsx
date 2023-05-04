import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.electron.addLoginListener(uname => {
            navigate("/main");
        });
    });

    return (
        <div className="h_center v_center login">
            <h1>Bienvenue !</h1>
            <h2>
                Pour commencer à utiliser Power BI Search Engine,
                <br />
                connectez-vous à votre compte Microsoft<sup>©</sup> Power BI.
            </h2>
            <button onClick={window.electron.login}>Se connecter</button>
        </div>
    );
};

export default Login;
