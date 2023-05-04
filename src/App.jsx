import { Route, Router } from "electron-router-dom";
import React, { useEffect, useState } from "react";
import Login from "./routes/Login";
import Main from "./routes/Main";
import Settings from "./routes/Settings";
import Explore from "./routes/Explore";
import "./App.css";

const App = () => {
    const [username, setUsername] = useState("");
    const [appOptions, setAppOptions] = useState({});

    useEffect(() => {
        window.electron.addLoginListener(uname => {
            setUsername(uname);
        });

        window.electron.addOnAppOptionsReceivedListener(opts => {
            setAppOptions(opts);
        });

        window.electron.getAppOptions();
    }, []);

    return (
        <Router
            main={
                <>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/main"
                        element={<Main username={username} appOptions={appOptions} />}
                    />
                    <Route
                        path="/explore"
                        element={<Explore username={username} appOptions={appOptions} />}
                    />
                    <Route
                        path="/settings"
                        element={<Settings username={username} appOptions={appOptions} />}
                    />
                </>
            }
        />
    );
};

export default App;
