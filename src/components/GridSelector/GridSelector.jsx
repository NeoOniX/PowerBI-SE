/* eslint-disable react/prop-types */
import React, { useState } from "react";
import IconOption from "../IconOption/IconOption";
import Select from "react-select";
import "./GridSelector.css";
import { FcPlus } from "react-icons/fc";

const GridSelector = props => {
    const options = props.entries.map(workspace => {
        return { value: workspace.name, label: workspace.name, icon: workspace.icon };
    });

    const [currentSelection, setCurrentSelection] = useState({});

    return (
        <div className="grid-selector">
            <Select
                className="searchbox m10"
                placeholder={"Espace de travail..."}
                onChange={setCurrentSelection}
                options={options}
                components={{ Option: IconOption }}
                defaultValue={null}
                noOptionsMessage={() => "Aucun"}
            />
            <button className="m10" onClick={() => props.add(props.index, currentSelection)}>
                <FcPlus />
            </button>
        </div>
    );
};

export default GridSelector;
