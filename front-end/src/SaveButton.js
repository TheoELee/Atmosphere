import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import '../src/ComponentStyle.css';

class SaveButton extends Component {
	constructor( props ) {
		super( props );
		
	}

	render() {
		return (
			<div className="container">
				<Button className='SaveButton' variant="light" size="lg" block>
                    <p>Save Playlist</p> 
                 </Button>
			</div>
		)
	}
}
export default SaveButton;