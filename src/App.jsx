import React, { useEffect, useState } from "react";
import Login from "./routes/Login";
import Main from "./routes/Main";
import Settings from "./routes/Settings";
import "./App.css";

const App = () => {
    // Navigation
    const [page, setPage] = useState("login");

    // Edit
    const [edit, setEdit] = useState(null);

    // Login & AppOptions
    const [username, setUsername] = useState("");
    const [appOptions, setAppOptions] = useState({});

    useEffect(() => {
        window.electron.addLoginListener(uname => {
            setUsername(uname);
            setPage("main");
        });

        window.electron.addOnAppOptionsReceivedListener(opts => {
            setAppOptions(opts);
        });

        window.electron.getAppOptions();
    }, []);

    // Theme

    const setLightTheme = lightTheme => {
        window.electron.setAppOptions({ ...appOptions, lightTheme });
    };

    // Config
    const [config, setConfig] = useState([]);
    const [entries, setEntries] = useState([]);
    const [workspaces, setWorkspaces] = useState([]);

    // Process
    const [processing, setProcessing] = useState(false);
    const startProcess = () => {
        setProcessing(true);
        window.electron.startProcess();
    };

    const stopProcess = () => {
        window.electron.stopProcess();
    };

    useEffect(() => {
        window.electron.setProcessEndListener(() => {
            setProcessing(false);
        });
        window.electron.getWorkspaces();
    }, []);

    // Entries

    const sort = (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0);

    const addWorkspace = (pi, w) => {
        if (Object.keys(w).length === 0) return;

        // Add Workspace
        const wen = entries.find(en => en.name === w.label);
        if (wen === undefined || wen === null) return;
        const cfg = config;
        const p = cfg[pi];
        if (p.includes(w)) return;
        const r = [...p, wen];
        r.sort(sort);
        cfg[pi] = r;
        window.electron.updateConfig(cfg);

        // Remove Choice
        const e = entries.filter(en => en.name !== w.label);
        setEntries(e);
    };

    const removeWorkspace = (pi, w) => {
        // Remove Workspace
        const cfg = config;
        cfg[pi] = cfg[pi].filter(ws => ws.name !== w.name);
        window.electron.updateConfig(cfg);

        // Add Choice
        const e = workspaces.find(en => en.name === w.name);
        const r = [...entries, e];
        r.sort(sort);
        setEntries(r);
    };

    const removeProcess = pi => {
        const cfg = config;
        cfg.splice(pi, 1);
        window.electron.updateConfig(cfg);
    };

    // Workspace Discovery
    const [discovery, setDiscovery] = useState(false);

    const startWD = () => {
        window.electron.startWorkspacesDiscovery();
        setDiscovery(true);
    };

    const stopWD = () => {
        window.electron.stopWorkspacesDiscovery();
        setDiscovery(false);
    };

    // SETUP
    useEffect(() => {
        window.electron.setWorkspacesDiscoveryListener(dworkspaces => {
            // Set workspace and discovery
            setWorkspaces(dworkspaces);
            setDiscovery(false);

            // Set entries
            let en = dworkspaces;
            for (const p of config) {
                for (const w of p) {
                    en = en.filter(en => en.name !== w.name);
                }
            }

            setEntries(en);
        });
    }, [config]);

    useEffect(() => {
        window.electron.setConfigReceivedListener(cfg => {
            let en = workspaces;
            for (const p of cfg) {
                for (const w of p) {
                    en = en.filter(en => en.name !== w.name);
                }
            }
            setEntries(en);
            setConfig(cfg);
        });
    }, [workspaces]);

    useEffect(() => {
        for (const p of config) {
            for (const w of p) {
                if (edit !== null && w.id === edit.id) {
                    setEdit(w);
                }
            }
        }
    }, [config]);

    // Update
    const [update, setUpdate] = useState("hidden");
    useEffect(() => {
        window.electron.setUpdateAvailableListener(() => {
            setUpdate("visible");
        });

        window.electron.setUpdateDownloadedListener(() => {
            setUpdate("downloaded");
        });
    });

    // Wait for AppOptions to load...

    if (appOptions === undefined) return <></>;

    return (
        <>
            <link rel="stylesheet" href={appOptions.lightTheme ? "light.css" : "dark.css"}></link>
            {page === "login" && <Login />}
            {page === "main" && (
                <Main
                    username={username}
                    setLightTheme={setLightTheme}
                    appOptions={appOptions}
                    setPage={setPage}
                    processing={processing}
                    startProcess={startProcess}
                    stopProcess={stopProcess}
                    addWorkspace={addWorkspace}
                    removeWorkspace={removeWorkspace}
                    removeProcess={removeProcess}
                    discovery={discovery}
                    startWD={startWD}
                    stopWD={stopWD}
                    config={config}
                    entries={entries}
                    edit={edit}
                    setEdit={setEdit}
                    update={update}
                    setUpdate={setUpdate}
                />
            )}
            {page === "settings" && (
                <Settings
                    username={username}
                    setLightTheme={setLightTheme}
                    appOptions={appOptions}
                    setPage={setPage}
                />
            )}
        </>
    );
};

export default App;
