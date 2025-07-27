import { useEffect, useState } from 'react';
import { page, content, messagesSection, contactsClass, link, selected, messageClass, username, date, formClass } from './App.module.css';
import { Link } from 'react-router-dom';

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
        const res = await fetch(`http://localhost:3000/message`,
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

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch(`http://localhost:3000/contacts`,  // try with process.env.URL
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

  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`http://localhost:3000/messages/${selectedContact}`,
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

  }, [selectedContact])

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

      { contacts && 
        <div className={ content }>
          <nav className={ contactsClass }>
            <ul>
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