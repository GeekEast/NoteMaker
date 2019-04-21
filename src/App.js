import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { listNotes } from './graphql/queries';
import { createNote, deleteNote, updateNote } from './graphql/mutations';

class App extends Component {
	state = {
		id: null,
		note: '',
		notes: []
	};

	componentDidMount = async () => {
		const result = await API.graphql(graphqlOperation(listNotes));
		this.setState({ notes: result.data.listNotes.items });
	};

	handleNoteChange = (event) => {
		this.setState({ note: event.target.value });
	};

	handleAddNote = async (event) => {
		event.preventDefault();
		const { note, notes, id } = this.state;
		const input = id ? { id: id, note: note } : { note: note };
		const result = id
			? await API.graphql(graphqlOperation(updateNote, { input }))
			: await API.graphql(graphqlOperation(createNote, { input }));
		const updatedNote = id ? result.data.updateNote : result.data.createNote;

		let updatedNotes;
		if (id) {
			updatedNotes = notes.map((item) => {
				if (item.id === updatedNote.id) return updatedNote;
				return item;
			});
		} else {
			// 为何只能在后面更改state，因为要等待id被赋值
			updatedNotes = [ updatedNote, ...notes ];
		}
		this.setState({ notes: updatedNotes, note: '', id: '' });
	};

	handleDeleteNotes = async (item) => {
		const input = { id: item.id };
		const { notes } = this.state;
		// remotely delete
		const result = await API.graphql(graphqlOperation(deleteNote, { input }));
		const { id } = result.data.deleteNote;
		// locally delete
		const newNotes = notes.filter((item) => item.id !== id);
		this.setState({ notes: newNotes });
	};

	handleSelectNote = ({ id, note }) => {
		this.setState({ note, id });
	};

	render() {
		const { id } = this.state;
		return (
			<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
				<h1 className="code f2-l">Amplify NoteMaker</h1>
				{/* Note Form */}
				<form className="mb3" onSubmit={this.handleAddNote}>
					<input
						type="text"
						className="pa2 f4"
						placeholder="Write your note!"
						onChange={this.handleNoteChange}
						value={this.state.note}
					/>
					<button className="pa2 f4" type="submit">
						{id ? 'Modify' : 'Add Note'}
					</button>
				</form>

				{/* Notes List */}
				<div>
					{this.state.notes.map((item) => (
						<div key={item.id} className="flex items-center">
							<li className="list pa1 f3" onClick={() => this.handleSelectNote(item)}>
								{item.note}
							</li>
							<button className="bg-transparent bn f4" onClick={() => this.handleDeleteNotes(item)}>
								<span>&times;</span>
							</button>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withAuthenticator(App, { includeGreetings: true });
