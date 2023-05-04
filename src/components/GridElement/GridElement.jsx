/* eslint-disable react/prop-types */
import React from "react";
import "./GridElement.css";

const GridElement = props => {
    return (
        <div className="grid-element">
            <div className="workspace-infos">
                <img
                    src={props.workspace.icon !== null ? props.workspace.icon : "pbi-logo.svg"}
                    style={{ width: 32 }}
                    alt={props.workspace.name}
                />
                <span>{props.workspace.name}</span>
            </div>
            <button className="delete" onClick={props.removeWorkspace}>
                x
            </button>
            {/* <button onClick={() => window.electron.crawl(props.workspace.id)}>C</button> */}
        </div>
    );
};

export default GridElement;
