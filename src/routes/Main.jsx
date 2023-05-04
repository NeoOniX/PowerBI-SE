/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Grid from "../components/Grid/Grid";
import { useNavigate } from "react-router-dom";

const Main = props => {
    // Navigate
    const navigate = useNavigate();

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

    return (
        <div className="container">
            <div className="navbar">
                <div>{props.username === "" ? "Non connecté" : props.username}</div>
                <div className="separator"></div>
                <button onClick={processing ? stopProcess : startProcess}>
                    {processing && (
                        <svg
                            version="1.1"
                            id="L9"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            viewBox="0 0 100 100"
                        >
                            <path
                                fill="#fff"
                                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    dur="1s"
                                    from="0 50 50"
                                    to="360 50 50"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                    )}
                    {processing ? "Arrêter" : "Démarrer"} les processus
                </button>
                <div className="separator"></div>
                <button onClick={discovery ? stopWD : startWD}>
                    {discovery && (
                        <svg
                            version="1.1"
                            id="L9"
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            viewBox="0 0 100 100"
                        >
                            <path
                                fill="#fff"
                                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    dur="1s"
                                    from="0 50 50"
                                    to="360 50 50"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                    )}
                    Découverte des espaces de travail
                </button>
                <div className="separator"></div>
                <button onClick={() => window.electron.readConfig()}>
                    Ouvrir une configuration
                </button>
                <button onClick={() => window.electron.writeConfig()}>
                    Enregistrer une configuration
                </button>
                <div className="separator"></div>
                <button onClick={() => navigate("/explore")}>Recherche</button>
                <div className="separator"></div>
                <button onClick={() => navigate("/settings")}>Paramètres</button>
            </div>

            <div className="content h_center">
                <h1>Configuration :</h1>
                <div className="main">
                    <ul>
                        {config.map((p, i) => {
                            return (
                                <li key={i}>
                                    <Grid
                                        index={i}
                                        config={p}
                                        entries={entries}
                                        addWorkspace={addWorkspace}
                                        removeWorkspace={removeWorkspace}
                                        removeProcess={removeProcess}
                                    />
                                </li>
                            );
                        })}
                        <li>
                            <button onClick={() => window.electron.updateConfig([...config, []])}>
                                + Nouveau processus
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Main;
