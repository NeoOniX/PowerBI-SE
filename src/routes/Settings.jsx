/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";

const Settings = props => {
    // Navigate
    const navigate = useNavigate();

    const setShowWindow = () => {
        const opts = props.appOptions;
        opts.showWindows = !opts.showWindows;
        window.electron.setAppOptions(opts);
    };

    const setShowDiscovery = () => {
        const opts = props.appOptions;
        opts.showDiscovery = !opts.showDiscovery;
        window.electron.setAppOptions(opts);
    };

    return (
        <div className="container">
            <div className="navbar">
                <div>{props.username === "" ? "Non connecté" : props.username}</div>
                <div className="separator"></div>
                <button onClick={() => navigate("/main")}>Processus</button>
                <div className="separator"></div>
                <button onClick={() => navigate("/explore")}>Recherche</button>
            </div>

            <div className="content h_center settings">
                <h1>Paramètres :</h1>
                <div>
                    <h2>Dossier d&apos;export</h2>
                    <div>
                        <button onClick={() => window.electron.setExportPath()}>
                            Sélectionner un dossier
                        </button>
                        <span className="as_text_input">
                            {props.appOptions.uploadPath.split("\\").join("/")}
                        </span>
                    </div>
                </div>
                <div>
                    <h2>Affichage des fenêtres</h2>
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
