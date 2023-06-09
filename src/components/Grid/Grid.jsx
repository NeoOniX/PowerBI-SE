/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import GridElement from "../GridElement/GridElement";
import GridSelector from "../GridSelector/GridSelector";
import "./Grid.css";
import { RxCross2 } from "react-icons/rx";

const Grid = props => {
    return (
        <div className="grid">
            <div className="top">
                <div className="title">
                    <h2>Processus N°{props.index + 1}</h2>
                </div>
                <button onClick={() => props.removeProcess(props.index)} className="delete">
                    <RxCross2 />
                </button>
            </div>
            <ul>
                {props.config.map((w, i) => {
                    return (
                        <li key={`${w.name}_${i}_${w.screenshot}`}>
                            <GridElement
                                workspace={w}
                                removeWorkspace={() => props.removeWorkspace(props.index, w)}
                                setEdit={props.setEdit}
                            />
                        </li>
                    );
                })}
                <li>
                    <GridSelector
                        entries={props.entries}
                        index={props.index}
                        add={props.addWorkspace}
                    />
                </li>
            </ul>
        </div>
    );
};

export default Grid;
