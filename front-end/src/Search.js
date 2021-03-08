import React, { Component } from 'react';
import '../src/ComponentStyle.css';

class Search extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			query: '',
                        results: {},
                        loading: false, //for live result
                        message: '',
		};
	}

    handleOnInputChange = (e) => {
        this.setState({query: e.target.value, loading: true, message: ''}); //property name and property value are the same

    };

	render() {
        const {query} = this.state; //object destructuring - const query = this.state.query.
		return (
			<div className="container">
				{/*Search Input*/}
				<label className="search-label" htmlFor="search-input">
                    <input
						type="text"
                        name="query"
						value={this.state.query}
						id="search-input"
						placeholder="search songs..."
                        size="100%"
                        onChange={this.handleOnInputChange}
					/>
					<i className="fa fa-search search-icon"/>
				</label>
				
			</div>
		)
	}
}
export default Search;