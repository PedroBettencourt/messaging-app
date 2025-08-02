import { useEffect, useState } from 'react';
import { page, content, messagesSection, contactsClass, link, selected, messageClass, username, date, formClass, newContactClass, obscure, buttons } from './App.module.css';
import { Link } from 'react-router-dom';

function Contact({ contacts, setContacts, setNewContact, setSelectedContact }) {

  const [input, setInput] = useState('');
  const [submit, setSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  function handleChange(e) {
    setInput(e.target.value);
  };

  function handleSubmit(e) {
    e.preventDefault();
    setSubmit(true);
  };

  function handleCancel() {
    setNewContact(false);
  };

  useEffect(() => {
    console.log("new contact")
    async function getContact() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API}/${input}`);
        const json = await res.json();

        if (json.username) {
          setContacts([...contacts, json.username]);
          setSelectedContact(json.username);
          setNewContact(false);
        } else {
          setResponse(json);
        };

      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        setSubmit(false);
      }
    };

    if (submit) {
      setIsLoading(true);
      setError(null);
      setResponse(null);
      getContact();
    }

  }, [submit]);

  return(
    <>
      <div className={ newContactClass }>
        { isLoading && <h2>Loading...</h2> }
        { error && <h2>Error</h2> }
        { response && <h2>{ response }</h2> }
        <form onSubmit={ handleSubmit }>
          <label htmlFor="username">Username</label>
          <input type="text" name='username' id='username' value={ input } onChange={ handleChange } />
          <div className={ buttons }>
            <button type="submit">Search</button>
            <button onClick={ handleCancel }>Cancel</button>
          </div>
        </form>
      </div>
      <div className={ obscure }></div>
    </>
  )
};

function Message({ contact, error, setError, messages, setMessages }) {
  const [input, setInput] = useState({});
  const [submit, setSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const content = e.target.value;
    setInput({...input, [contact]: content});
  };

  function handleSubmit(e) {
    e.preventDefault();
    setSubmit(true);
  };

  useEffect(() => {
    async function sendMessage() {
      try {
        const data = ({ recipient: contact, content: input[contact] });
        const res = await fetch(`${import.meta.env.VITE_API}/message`,
          {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.token}` },
          });
        const json = await res.json();
        setInput({...input, [contact]: '' });

        if(json.errors) setError(json.errors);
        else setMessages([...messages, json ]);

      } catch (err) {
        console.log(err)
        setError(err);
      } finally {
        setIsLoading(false);
        setSubmit(false);
      }
    };

    if (submit) {
      setError(null);
      setIsLoading(true);
      sendMessage();
      
    };

  }, [submit]);

  return (
    <>
      { isLoading && <h2>Loading...</h2> }
      { error && <h2>Error</h2> }
      { error && Array.isArray(error) &&
        <ul>
          { error.map(error => <li>{error.msg}</li>) }
        </ul>}
      <form className={ formClass } onSubmit={ handleSubmit }>
        <textarea name='content' id='content' onChange={ handleChange } value={ input[contact] || '' }></textarea>
        <button type="submit">Send</button>
      </form>
    </>
  )
}

function App() {

  const [contacts, setContacts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState(null);

  const [newContact, setNewContact] = useState(false);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API}/contacts`,  // try with process.env.URL
          {
            headers: { "Authorization": `Bearer ${localStorage.token}` }
          });
        
        const json = await res.json();
        setContacts(json);

      } catch(err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
    setIsLoading(true);

  }, []);

  function handleClick(e) {
    setSelectedContact(e.target.innerText);
  };

  function handleNewContact() {
    setNewContact(true);
  }

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API}/${selectedContact}`,
          {
            headers: { "Authorization": `Bearer ${localStorage.token}` }
          });

          const json = await res.json();
          setMessages(json);
          setError(null);

      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchMessages();

  }, [selectedContact]);

  return (
    <div className={ page }>
      <h1>Main Page</h1>
      { isLoading && <h2>Loading...</h2> }
      
      { !contacts && error && 
        <div>
          <h2>No user logged in</h2>
          <Link to="/login" className={ link }>Login</Link>
        </div> 
      }

      { newContact && <Contact contacts={ contacts} setContacts={ setContacts } setNewContact={ setNewContact } setSelectedContact={ setSelectedContact } />}

      { contacts && 
        <div className={ content }>
          <nav className={ contactsClass }>
            <ul>
              <li onClick={ handleNewContact }>New Contact</li>
              {contacts.map(contact => (
                <>
                  { (selectedContact === contact) 
                    ? <li key={contact} onClick={ handleClick } className={ selected }>{contact}</li>
                    : <li key={contact} onClick={ handleClick }>{contact}</li>
                  }
                </>
              ))}
            </ul>
          </nav>

          <section className={ messagesSection }>
              { error && !messages && <h2>No messages</h2> }
              { messages && 
                <>
                  <ul>
                    {messages.map(message => (
                      <li key={message.id} className={ messageClass }>
                        <div>
                          <div className={ username }>{ message.author }</div>
                          <div className= { date }>{ new Date(message.sentAt).toLocaleString() }</div>
                        </div>
                        <div>{ message.content }</div>
                      </li>
                    ))}
                  </ul>
                  <Message contact={ selectedContact } error={ error } setError={ setError } messages={ messages } setMessages={ setMessages } />
                </>
              }
          </section>
        </div>
      }
    </div>
  );
}

export default App