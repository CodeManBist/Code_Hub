import React, { useState, useEffect } from 'react'



const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/user/${userId}`);
        
        const data = await response.json();
        setRepositories(data.repositories);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(`http://localhost:3000/repo/all`);
        
        const data = await response.json();
        setSuggestedRepositories(data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();

  }, []);

  useEffect(() => {
    if(searchQuery == '') {
      setSearchResults([]);
    } else {
      const filteredRepo = repositories.filter(repo => 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <section className='flex justify-between'>
      <aside>
        <h3>Suggested Repositories</h3>
        { suggestedRepositories.map((repo) => {
          return(
          <div key={repo._id}>
            <h4>{repo.name}</h4>
            <h4>{repo.description}</h4>
          </div>
          )
        })}
      </aside>
      <main>
        <h2>Your Repositories</h2>
        <div>
          <input 
            type="text" 
            value={searchQuery}
            placeholder='Search..'
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {(searchQuery ? searchResults : repositories).map((repo) => {
          return (
            <div key={repo._id}>
              <h4>{repo.name}</h4>
              <h4>{repo.description}</h4>
            </div>
          )
      })}
      </main>
      <aside>
        <h2>Upcoming Events</h2>
        <ul>
          <li><p>Tech Conference - Dec 15</p></li>
          <li><p>Developer Meetup - Dec 25</p></li>
          <li><p>React Summit - April 30</p></li>
        </ul>
      </aside>
    </section>
  )
}

export default Dashboard
