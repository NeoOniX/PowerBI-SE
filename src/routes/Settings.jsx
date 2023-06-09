/* eslint-disable react/prop-types */
import React from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { FcComboChart, FcPlus, FcReadingEbook } from "react-icons/fc";
import { MdCancel } from "react-icons/md";

const Settings = props => {
    const setShowWindow = () => {
        window.electron.setAppOptions({
            ...props.appOptions,
            showWindows: !props.appOptions.showWindows,
        });
    };

    const setShowDiscovery = () => {
        window.electron.setAppOptions({
            ...props.appOptions,
            showDiscovery: !props.appOptions.showDiscovery,
        });
    };

    const changeExportFormat = (i, format) => {
        const opts = props.appOptions;
        opts.globalPaths.exports[i].format = format;
        window.electron.setAppOptions(opts);
    };

    const changeAnomalieFormat = (i, format) => {
        const opts = props.appOptions;
        opts.globalPaths.anomalies[i].format = format;
        window.electron.setAppOptions(opts);
    };

    const removeExport = i => {
        window.electron.setAppOptions({
            ...props.appOptions,
            globalPaths: {
                exports: props.appOptions.globalPaths.exports.filter((p, j) => j !== i),
                anomalies: props.appOptions.globalPaths.anomalies,
            },
        });
    };

    const removeAnomalie = i => {
        window.electron.setAppOptions({
            ...props.appOptions,
            globalPaths: {
                anomalies: props.appOptions.globalPaths.anomalies.filter((p, j) => j !== i),
                exports: props.appOptions.globalPaths.exports,
            },
        });
    };

    return (
        <div className="container">
            <div className="bar navbar">
                <div>
                    <FcReadingEbook />
                    {props.username === "" ? "Non connecté" : props.username}
                </div>
                <div className="separator"></div>
                <button
                    className="icon"
                    onClick={() => props.setLightTheme(!props.appOptions.lightTheme)}
                >
                    {props.appOptions.lightTheme ? (
                        <BiSun fill="#ffff00" />
                    ) : (
                        <BiMoon fill="#e0e7ff" />
                    )}
                </button>
                <div className="separator"></div>
                <button className="icon" onClick={() => props.setPage("main")}>
                    <FcComboChart />
                </button>
            </div>

            <div className="content h_center settings">
                <h1>Paramètres :</h1>
                <div>
                    <h2>Exports globaux</h2>
                    <p className="description">
                        Chemins d&apos;accès des dossiers où toutes les données seront
                        automatiquement exportées.
                    </p>
                    <div className="exports">
                        <p>Résultats :</p>
                        {props.appOptions.globalPaths.exports.map((exportPath, i) => (
                            <div key={i}>
                                <span>Emplacement :</span>
                                <span className="as_text_input">
                                    {exportPath.path.split("\\").join("/")}
                                </span>
                                <span>Format :</span>
                                <span
                                    className="as_text_input"
                                    contentEditable
                                    onBlur={e => changeExportFormat(i, e.target.textContent)}
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                >
                                    {exportPath.format}
                                </span>
                                <div className="spacing"></div>
                                <button onClick={() => removeExport(i)}>
                                    <MdCancel />
                                </button>
                            </div>
                        ))}
                        <button onClick={() => window.electron.addGlobalExportPath()}>
                            <FcPlus className="m10" />
                            Ajouter un dossier de sortie des résultats
                        </button>
                        <p>Anomalies :</p>
                        {props.appOptions.globalPaths.anomalies.map((anomaliePath, i) => (
                            <div key={i}>
                                <span>Emplacement :</span>
                                <span className="as_text_input">
                                    {anomaliePath.path.split("\\").join("/")}
                                </span>
                                <span>Format :</span>
                                <span
                                    className="as_text_input"
                                    contentEditable
                                    onBlur={e => changeAnomalieFormat(i, e.target.textContent)}
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                >
                                    {anomaliePath.format}
                                </span>
                                <div className="spacing"></div>
                                <button onClick={() => removeAnomalie(i)}>
                                    <MdCancel />
                                </button>
                            </div>
                        ))}
                        <button onClick={() => window.electron.addGlobalAnomaliePath()}>
                            <FcPlus className="m10" />
                            Ajouter un dossier de sortie des anomalies
                        </button>
                    </div>
                </div>
                <div>
                    <h2>Affichage des fenêtres</h2>
                    <p className="description">
                        Permet l&apos;affichage des fenêtres habituellement en arrière-plan.
                    </p>
                    <div>
                        <input
                            type="checkbox"
                            name="show_win"
                            id="show_win"
                            onClick={setShowWindow}
                            checked={props.appOptions.showWindows}
                            readOnly={true}
                        />
                        <span>Afficher les fenêtres utilisées par les processus</span>
                    </div>
                    <div>
                        <input
                            type="checkbox"
                            name="show_dsc"
                            id="show_dsc"
                            onClick={setShowDiscovery}
                            checked={props.appOptions.showDiscovery}
                            readOnly={true}
                        />
                        <span>
                            Afficher la fenêtre utilisée pour la découverte des espaces de travail
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
