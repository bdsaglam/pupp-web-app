import _ from "lodash";
import Fuse from "fuse.js";
import React, { Component } from "react";
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ContentList from "./ContentList";
import SearchBar from "./SearchBar";

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
                <Row>
                    <Col sm={12} md={4} mdPush={8}>
                        <SearchBar onSubmit={this.handleSearch} />
                    </Col>
                    <Col sm={12} md={8} mdPull={4}>
                        <ContentList contents={contents} videos={videos} trackRecords={trackRecords} />
                    </Col>
                </Row>
            </div>
        );
    }

}


export default FilterableContentList;
