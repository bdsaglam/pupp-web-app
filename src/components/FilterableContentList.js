import _ from "lodash";
import Fuse from "fuse.js";
import React, { Component } from "react";
import ContentList from "./ContentList";
import SearchBar from "./SearchBar";

import "./FilterableContentList.css";

class FilterableContentList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchText: "",
            levels: [],
        };
    }

    handleSearch = ({ searchText, levels }) => {
        this.setState({ searchText, levels });
    }

    filter = () => {
        var contentArray = _.values(this.props.contents);
        contentArray = this.filterLevel(contentArray, this.state.levels);
        contentArray = this.filterText(contentArray, this.state.searchText);
        return contentArray;
    };

    filterLevel = (contentArray, levels) => {
        if (levels.length === 0) return contentArray;

        return contentArray.filter(content => {
            if (levels.includes(content.level)) {
                return true;
            }
            return false;
        });
    }

    filterText = (contentArray, searchText) => {
        if (searchText === "") return contentArray;

        var options = {
            minMatchCharLength: 2,
            threshold: 0.3,
            keys: ['title', 'tags', 'skills', 'scenario']
        };
        var fuse = new Fuse(contentArray, options);
        return fuse.search(searchText);
    }

    getFilteredObjects(obj, ids) {
        var result = _.pickBy(obj, (value, key) => {
            return ids.includes(key);
        });

        return result;
    }

    render() {
        const contentArray = this.filter();
        const contentIds = contentArray.map(c => c.id);

        const contents = _.mapKeys(contentArray, "id");
        const videos = this.getFilteredObjects(this.props.videos, contentIds);
        const trackRecords = this.getFilteredObjects(this.props.trackRecords, contentIds);

        return (
            <div className="FilterableContentList">
                <SearchBar onSubmit={this.handleSearch} />
                <ContentList contents={contents} videos={videos} trackRecords={trackRecords} />
            </div>
        );
    }

}


export default FilterableContentList;
