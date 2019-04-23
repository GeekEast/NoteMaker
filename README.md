## 1. Preparation
### Install Create-React-App
```sh
sudo npm i -g create-react-app
# or
yarn global add create-react-app
```

### Install Amplify Cli
```sh
yarn global add @aws-amplify/cli
```

### Configure Amplify with AWS Account
```sh
amplify configure
```

### Initialize Project
```sh
create-react-app project1
```

### Initialize Project with Amplify
```sh
amplify init
```
## 2. Frontend - Simple Page
### Add Tachyons CSS to Index.html
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tachyons/4.11.1/tachyons.min.css">
```
### [Tachyons CSS Stylings](https://tachyons.io/docs/table-of-styles/)
```html
<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
</div>
```
- **flex**: display:flex 布局模式为flex
- **flex-column**: flex-direction:column 主轴方向为上下
- **items-center**: align-items:center 沿主轴居中
- **justify-center**: justify-content:center 垂直于主轴居中
- **pa3**: padding: 1rem; 1rem相对于root元素字体大小的10%
- **bg-washed-red**: background-color:var(--washed-red)
- **code**: font-family:Consolas, monaco, monospace
- **f2-l**: font-size:2.25rem
- **mb3**: margin-bottom:var(--spacing-medium)
- **list**: list-style-type:none
- **bg-transparent**: background-color:var(--transparent)
- **bn**: border-style:none border-width:0
- [\&times;](http://www.w3school.com.cn/html/html_entities.asp) 乘号 

## 3. Backend - API & Database
### Add Amplify API
```sh
amplify add api
# Edit the GraphQL Schema
amplify push # this will deploy backend resources in the cloud
# query code generated in src/graphql folder
amplify console -> api # get in AppSync to inspect your porject
```

### [GraphQL Basics](https://graphql.org/learn/schema/)
#### Type Language
```graphql
type Post @model {
    id: ID!
    title: String
    metadata: MetaData
}
type MetaData {
    category: Category
}
enum Category { comedy news }
```
- Post: a GraphQL Object Type
- id, title, metadata: fields of Character object.
- !: non-nullable
- Category: Enumeration Types
  
#### Scalar Types
- **Int**: 32-bit integer
- **Float**: double-precision floating-point value
- **String**: UTF-8 Character sequence
- **Boolean**: true of false
- **ID**: uuid
- **[]**: array
- **enum**: wherever we use the type Category, we expect it to be exactly one of comedy or news.

#### [Directives](https://aws-amplify.github.io/docs/cli/graphql)
- **@model**: 
  - Objects annotated with @model are stored in **Amazon DynamoDB** 
  - capable of being protected via **@auth**, 
  - related to other objects via **@connection**, 
  - and streamed into Amazon **Elasticsearch** via **@searchable**.
  - **automatically configure CRUDL queries and mutations.**
- **@auth**: 
  - only supports APIs with **Amazon Cognito User Pools** enabled. 
- **@connection**: one-one, one-to-many, many-to-many
- **@versioned**: directive adds object versioning and conflict resolution to a type.
- **@searchable**:handles streaming the data of an @model object type to Amazon Elasticsearch Service and configures search resolvers that search that information.

### Integrate React with Amplify
```sh
yarn add aws-amplify aws-amplify-react
```
```javascript
// app.js
import Amplify from 'aws-amplify';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);
```
## 4. Authentication
### Add Amplify Auth (HOC)
```javascript
// app.js
import { withAuthenticator } from 'aws-amplify-react';
export default withAuthenticator(App, { includeGreetings: true });
```

<img style="width: 400px; margin: auto" src="https://s3-ap-southeast-2.amazonaws.com/geekeaskblogpics/posts/WX20190420-131926.png"></img>



### User-specific Page
- Modify GraphQL Schema
```graphql
type Note @model @auth(rules: [{ allow: owner }]) {
	id: ID!
	note: String!
}
```
- Clear DynamoDB Data
- Amplify Update
```sh
amplify update api
amplify push # must push after update locally
```
## 5. Code Improvement: Subscription
### GraphQL Subscription
- **Subscription**: Once the `remote update` is completed, the update of `local state` will be applied.
- In `handle` function, you don't have to worry about updating state locally.
- This will increase code **resuability**.
- Subscription follows **`one-to-many`** trigger schema.
```javascript
// App_Sub.js
componentDidMount = async () => {
	const result = await API.graphql(graphqlOperation(listNotes));
	this.setState({ notes: result.data.listNotes.items });

	API.graphql(graphqlOperation(onCreateNote)).subscribe({
		next: (noteData) => {
			const { id, note } = noteData.value.data.onCreateNote;
			const prevNotes = this.state.notes;
			const updatedNotes = [ { id, note }, ...prevNotes ];
			this.setState({ notes: updatedNotes, id: null, note: '' });
		}
	});

	API.graphql(graphqlOperation(onDeleteNote)).subscribe({
		next: (noteData) => {
			const { id } = noteData.value.data.onDeleteNote;
			const prevNotes = this.state.notes;
			const updatedNotes = prevNotes.filter((item) => item.id !== id);
			this.setState({ notes: updatedNotes });
		}
	});

	API.graphql(graphqlOperation(onUpdateNote)).subscribe({
		next: (noteData) => {
			const { id, note } = noteData.value.data.onUpdateNote;
			const prevNotes = this.state.notes;
			const updatedNotes = prevNotes.map((item) => {
				if (item.id === id) return { id, note };
					return item;
			});

			this.setState({ notes: updatedNotes, id: null, note: '' });
		}
	});
};
```

## 6. Deployment
```sh
amplify add hosting
amplify publish # must be publish
```

## 7. Summary
### 1. Insight
- Click on **Button** will trigger **onSubmit** of the outside **From**.
- The location of `preventDefault()` doesn't matter.

### 2. Question
- What's the difference between type and input?

### 3. Resource
- CSS Libraries
  - [Semantic UI](https://semantic-ui.com/)
  - [Bootstrap](https://getbootstrap.com/)
  - [Tachyons](http://tachyons.io/components/)

