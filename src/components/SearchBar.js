import _ from "lodash";
import React, { Component } from "react";
import PropTypes from 'prop-types';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Checkbox from 'react-bootstrap/lib/Checkbox';

import "./SearchBar.css";

class SearchBar extends Component {
    constructor(props) {
        super(props);

        // debounce the passed in dispatch method
        this.onSubmit = _.debounce(this.props.onSubmit, 500);

        this.state = {
            searchText: "",
            selectedLevels: new Set(),
        };
    }

    validateForm() {
        // return this.state.searchText.length > 0 || this.state.selectedLevels.size > 0;
        return true;
    }

    submit = () => {
        var searchText = this.state.searchText;
        const unacceptables = ["", " ", ".", ",", ";", "'"];
        searchText = searchText.trim();
        searchText = unacceptables.includes(searchText) ? "" : searchText;

        const levels = [...this.state.selectedLevels].map(i => parseInt(i, 10));
        this.onSubmit({ searchText, levels });

    }

    handleSearchChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        }, this.submit);
    }

    handleLevelChange = event => {
        var selectedLevels = new Set(this.state.selectedLevels);
        const value = event.target.value;
        if (event.target.checked) {
            selectedLevels.add(value);
        }
        else {
            selectedLevels.delete(value);
        }
        this.setState({ selectedLevels }, this.submit);
    }

    handleSubmit = async event => {
        event.preventDefault();
        this.submit();
    }

    render() {
        return (
            <div className="SearchBar">
                <form onSubmit={this.handleSubmit}>
                    <FormGroup controlId="searchText" bsSize="sm">
                        <FormControl
                            autoFocus
                            type="text"
                            value={this.state.searchText}
                            onChange={this.handleSearchChange}
                        />
                    </FormGroup>
                    <FormGroup className="LevelGroup">
                        <ControlLabel>Level</ControlLabel>
                        <Checkbox value={1} onChange={this.handleLevelChange} inline>1</Checkbox>
                        <Checkbox value={2} onChange={this.handleLevelChange} inline>2</Checkbox>
                        <Checkbox value={3} onChange={this.handleLevelChange} inline>3</Checkbox>
                        <Checkbox value={4} onChange={this.handleLevelChange} inline>4</Checkbox>
                        <Checkbox value={5} onChange={this.handleLevelChange} inline>5</Checkbox>
                    </FormGroup>
                </form>
            </div>
        );
    }
}


export default SearchBar;