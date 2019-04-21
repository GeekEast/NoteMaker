import React, { Component } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { listNotes } from './graphql/queries';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { onCreateNote, onDeleteNote, onUpdateNote } from './graphql/subscriptions';

class App extends Component {
	state = {
		id: null,
		note: '',
		notes: []
	};

	componentDidMount = async () => {
		const result = await API.graphql(graphqlOperation(listNotes));
		this.setState({ notes: result.data.listNotes.items });

		API.graphql(graphqlOperation(onCreateNote)).subscribe({
			next: (noteData) => {
				const { id, note } = noteData.value.data.onCreateNote;
				const { notes } = this.state;
				const updatedNotes = [ { id, note }, ...notes ];
				this.setState({ notes: updatedNotes, id: null, note: '' });
			}
		});

		API.graphql(graphqlOperation(onDeleteNote)).subscribe({
			next: (noteData) => {
				const { id } = noteData.value.data.onDeleteNote;
				const { notes } = this.state;
				const updatedNotes = notes.filter((item) => item.id !== id);
				this.setState({ notes: updatedNotes });
			}
		});

		API.graphql(graphqlOperation(onUpdateNote)).subscribe({
			next: (noteData) => {
				const { id, note } = noteData.value.data.onUpdateNote;
				const { notes } = this.state;
				const updatedNotes = notes.map((item) => {
					if (item.id === id) return { id, note };
					if (item.id === id) {
						return { id, note };
					} else {
						return item;
					}
				});
				this.setState({ notes: updatedNotes, id: null, note: '' });
			}
		});
	};

	handleNoteChange = (event) => {
		this.setState({ note: event.target.value });
	};

	handleAddNote = async (event) => {
		event.preventDefault();
		const { id, note } = this.state;
		const input = id ? { id: id, note: note } : { note: note };
		id
			? await API.graphql(graphqlOperation(updateNote, { input }))
			: await API.graphql(graphqlOperation(createNote, { input }));
	};

	handleDeleteNotes = async (item) => {
		const input = { id: item.id };
		await API.graphql(graphqlOperation(deleteNote, { input }));
	};

	handleSelectNote = ({ id, note }) => {
		this.setState({ note, id });
	};

	render() {
		const { id, note } = this.state;
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
						value={note}
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
