/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import IconOption from "../components/IconOption/IconOption";

const Explore = props => {
    // Navigate
    const navigate = useNavigate();

    // Data
    const [data, setData] = useState({ Exports: [], Anomalies: [] });
    const [show, setShow] = useState({ Exports: [], Anomalies: [] });

    useEffect(() => {
        window.electron.setDataListener(data => {
            setData(data);

            const out = [];

            for (const ed of data.Exports) {
                if (out.find(w => w.value === ed.WorkspaceName) === undefined) {
                    out.push({
                        value: ed.WorkspaceName,
                        label: ed.WorkspaceName,
                        icon: ed.WorkspaceIcon,
                    });
                }
            }

            setOptions(out);
        });
        window.electron.getData();
    }, []);

    // Selection & Search
    const [currentSelection, setCurrentSelection] = useState([]);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let out = [];
        // Limit to selection

        if (currentSelection.length === 0) {
            out = data.Exports;
        }

        for (const sel of currentSelection) {
            out = [...out, ...data.Exports.filter(w => w.WorkspaceName === sel.value)];
        }

        // Search
        const out2 = {};
        for (const s of search.split(" ")) {
            if (s.length === 0) continue;
            out.filter(w => w.Tags.includes(s)).forEach(w => {
                out2[w.PageName] = w;
            });
        }
        out = search.length !== 0 ? Object.values(out2) : out;

        setShow({ Anomalies: data.Anomalies, Exports: out });
    }, [currentSelection, data, search]);

    return (
        <div className="container">
            <div className="navbar">
                <div>{props.username === "" ? "Non connecté" : props.username}</div>
                <div className="separator"></div>
                <button onClick={() => navigate("/main")}>Processus</button>
                <div className="separator"></div>
                <button onClick={() => navigate("/settings")}>Paramètres</button>
            </div>

            <div className="content h_center">
                <h1>Recherche :</h1>
                <div className="search_header">
                    <div>
                        <label htmlFor="search">Rechercher:</label>
                        <input
                            className="search_filter"
                            type="text"
                            name="search"
                            id="search"
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <span>Espace:</span>
                        <Select
                            className="search_filter searchbox"
                            placeholder={"Espace de travail..."}
                            onChange={setCurrentSelection}
                            options={options}
                            components={{ Option: IconOption }}
                            defaultValue={null}
                            noOptionsMessage={() => "Aucun"}
                            isMulti
                        />
                    </div>
                </div>
                <table className="search">
                    <thead>
                        <tr>
                            <th>Nom de la page</th>
                            <th>Nom du contenu</th>
                            <th>Type de contenu</th>
                            <th>Espace</th>
                        </tr>
                    </thead>
                    <tbody>
                        {show.Exports.map(exp => {
                            return (
                                <tr
                                    key={exp.URL}
                                    onClick={() => window.electron.openInBrowser(`${exp.URL}`)}
                                >
                                    <td>{exp.PageName}</td>
                                    <td>{exp.ContentName}</td>
                                    <td>{exp.ContentType}</td>
                                    <td>
                                        <div>
                                            <img
                                                src={
                                                    exp.WorkspaceIcon !== null
                                                        ? exp.WorkspaceIcon
                                                        : "pbi-logo.svg"
                                                }
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    objectFit: "contain",
                                                }}
                                                alt={exp.WorkspaceName}
                                            />
                                            <span>{exp.WorkspaceName}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Explore;
