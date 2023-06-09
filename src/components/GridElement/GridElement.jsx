/* eslint-disable react/prop-types */
import React from "react";
import "./GridElement.css";
import { MdCancel } from "react-icons/md";
import { FcSupport } from "react-icons/fc";

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
            <button onClick={() => props.setEdit(props.workspace)}>
                <FcSupport />
            </button>
            <button className="delete_element" onClick={props.removeWorkspace}>
                <MdCancel />
            </button>
            {/* <button onClick={() => window.electron.crawl(props.workspace.id)}>C</button> */}
        </div>
    );
};

export default GridElement;
