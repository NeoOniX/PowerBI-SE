/* eslint-disable react/prop-types */
import React from "react";
import { components } from "react-select";

const { Option } = components;

const IconOption = props => {
    return (
        <Option {...props}>
            <img
                src={props.data.icon !== null ? props.data.icon : "pbi-logo.svg"}
                style={{ width: 36 }}
                alt={props.data.label}
            />
            <span>{props.data.label}</span>
        </Option>
    );
};

export default IconOption;
