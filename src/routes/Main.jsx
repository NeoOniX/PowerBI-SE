/* eslint-disable react/prop-types */
import React from "react";
import Grid from "../components/Grid/Grid";
import { FcPlus, FcReadingEbook, FcSettings } from "react-icons/fc";
import { BiMoon, BiSun } from "react-icons/bi";
import PreviewModal from "../components/EditModal/EditModal";
import UpdateModal from "../components/UpdateModal/UpdateModal";

const Main = props => {
    return (
        <>
            {props.update !== "hidden" && (
                <UpdateModal update={props.update} setUpdate={props.setUpdate} />
            )}
            {props.edit !== null && (
                <PreviewModal edit={props.edit} setEdit={props.setEdit} config={props.config} />
            )}
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
                    <button className="icon" onClick={() => props.setPage("settings")}>
                        <FcSettings />
                    </button>
                </div>

                <div className="bar process_bar">
                    <button onClick={props.processing ? props.stopProcess : props.startProcess}>
                        {props.processing && (
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
                        {props.processing ? "Arrêter" : "Démarrer"} les processus
                    </button>
                    <div className="separator"></div>
                    <button onClick={props.discovery ? props.stopWD : props.startWD}>
                        {props.discovery && (
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
                </div>

                <div className="bar config_bar">
                    <button onClick={() => window.electron.readConfig()}>
                        Ouvrir une configuration
                    </button>

                    <div className="separator"></div>
                    <button onClick={() => window.electron.writeConfig()}>
                        Enregistrer une configuration
                    </button>
                </div>

                <div className="content h_center">
                    {/* <h1>Configuration :</h1> */}
                    <div className="main">
                        <ul>
                            {props.config.map((p, i) => {
                                return (
                                    <li key={i}>
                                        <Grid
                                            index={i}
                                            config={p}
                                            entries={props.entries}
                                            addWorkspace={props.addWorkspace}
                                            removeWorkspace={props.removeWorkspace}
                                            removeProcess={props.removeProcess}
                                            setEdit={props.setEdit}
                                        />
                                    </li>
                                );
                            })}
                            <li>
                                <button
                                    onClick={() =>
                                        window.electron.updateConfig([...props.config, []])
                                    }
                                >
                                    <FcPlus className="m10" /> Nouveau processus
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Main;
