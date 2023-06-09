/* eslint-disable react/prop-types */
import React from "react";
import "./EditModal.css";
import { FcPlus } from "react-icons/fc";
import { MdCancel } from "react-icons/md";

const EditModal = props => {
    const changeExportFormat = (i, format) => {
        const cfg = props.config;
        for (const p of cfg) {
            for (const w of p) {
                if (w.id === props.edit.id) {
                    w.paths.exports[i] = { ...w.paths.exports[i], format };
                }
            }
        }
        window.electron.updateConfig(cfg);
    };

    const changeAnomalieFormat = (i, format) => {
        const cfg = props.config;
        for (const p of cfg) {
            for (const w of p) {
                if (w.id === props.edit.id) {
                    w.paths.anomalies[i] = { ...w.paths.anomalies[i], format };
                }
            }
        }
        window.electron.updateConfig(cfg);
    };

    const removeExport = i => {
        const cfg = props.config;
        for (const p of cfg) {
            for (const w of p) {
                if (w.id === props.edit.id) {
                    w.paths.exports = w.paths.exports.filter((p, j) => j !== i);
                }
            }
        }
        window.electron.updateConfig(cfg);
    };

    const removeAnomalie = i => {
        const cfg = props.config;
        for (const p of cfg) {
            for (const w of p) {
                if (w.id === props.edit.id) {
                    w.paths.anomalies = w.paths.anomalies.filter((p, j) => j !== i);
                }
            }
        }
        window.electron.updateConfig(cfg);
    };

    return (
        <div className="background" onClick={() => props.setEdit(null)}>
            <div className="frame" onClick={e => e.stopPropagation()}>
                <div className="frame_top">
                    <span>{props.edit.name}</span>
                    <button className="close" onClick={() => props.setEdit(null)}>
                        X
                    </button>
                </div>
                <div className="frame_content">
                    <h3>Exports</h3>

                    <p className="description">
                        Chemins d&apos;accès des dossiers où les données de cet espace seront
                        exportées.
                    </p>

                    <ul>
                        {props.edit.paths.exports.map((path, i) => (
                            <li key={"exp_" + i}>
                                <span className="as_text_input">{path.path}</span>
                                <span
                                    className="as_text_input"
                                    onBlur={e => changeExportFormat(i, e.target.textContent)}
                                    contentEditable
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                >
                                    {path.format}
                                </span>
                                <div className="spacing"></div>
                                <button onClick={() => removeExport(i)}>
                                    <MdCancel />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button onClick={() => window.electron.addWorkspaceExport(props.edit)}>
                        <FcPlus className="m10" />
                        Ajouter un dossier de sortie des résultats
                    </button>

                    <h3>Anomalies</h3>

                    <p className="description">
                        Chemins d&apos;accès des dossiers où les anomalies de cet espace seront
                        exportées.
                    </p>

                    <ul>
                        {props.edit.paths.anomalies.map((path, i) => (
                            <li key={"ano_" + i}>
                                <span className="as_text_input">{path.path}</span>
                                <span
                                    className="as_text_input"
                                    onBlur={e => changeAnomalieFormat(i, e.target.textContent)}
                                    contentEditable
                                    suppressContentEditableWarning
                                    spellCheck={false}
                                >
                                    {path.format}
                                </span>
                                <div className="spacing"></div>
                                <button onClick={() => removeAnomalie(i)}>
                                    <MdCancel />
                                </button>
                            </li>
                        ))}
                    </ul>

                    <button onClick={() => window.electron.addWorkspaceAnomalie(props.edit)}>
                        <FcPlus className="m10" />
                        Ajouter un dossier de sortie des anomalies
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
