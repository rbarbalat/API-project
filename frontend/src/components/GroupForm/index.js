import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";


export default function GroupForm({formType})
{
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [type, setType] = useState();
    const [privatepublic, setPrivatePublic]  = useState();
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    //const [location, setLocation] = useState("");
    const [url, setUrl] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const history = useHistory();
    const alphabet = "abcdefghijklmnopqrstywzABCDEFGHIJKLMNOPQRSTYZ";

    useEffect(() => {
        const errors = {};
        //undefined when location is the empty string
        if(city[0] !== undefined)
        {
            if(!alphabet.includes(city[city.length - 1]))
            setCity(city.slice(0, city.length - 1));

            errors.city = "Location is required";
        }else
        {

        }
        if(name === "") errors.name = "Name is required";
        setValidationErrors(errors);
    }, [name, about, type, privatepublic, city, state, url])

    function onSubmit(event)
    {
        event.preventDefault();
        //push to the new group details page
        history.push("/");
    }
    if(formType === "edit") return null;
    return (
        <form onSubmit={onSubmit} className={formType === "create" ? "createGroupForm" : "editGroupForm"}>
            <div>
                <div>First, set your group's location</div>
                <div>Groups meet locally and online</div>
                <input type="text" name="city" placeholder="City"
                    value={city} onChange={e => setCity(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.city !== undefined
                    && validationErrors.city
                    }
                </div>
                <input type="text" name="state" placeholder="State"
                    value={state} onChange={e => setState(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.state !== undefined
                    && validationErrors.state
                    }
                </div>
            </div>

            <div>
                <div>What will your group's name be?</div>
                <div>Choose a name that will give people a clear idea</div>
                <input type="text" name="about" placeholder="What is your group's name?"
                    value={name} onChange={e => setName(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.about !== undefined
                    && validationErrors.about
                    }
                </div>
            </div>

            <div>
                <div>Now describe what your group will be about</div>
                <div>
                    People will this when we promote your group, but you'll be able
                    to add to it later
                </div>
                <ul>
                    <li>What's the purpose of your group?</li>
                    <li>Who sould join?</li>
                    <li>What will you do at your events??</li>
                </ul>
                <textarea type="text" name="name" placeholder="Please write at least 30 characters?"
                    value={about} onChange={e => setAbout(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.name !== undefined
                    && validationErrors.name
                    }
                </div>
            </div>

            <div>
                <div>Final Steps...</div>
                <div>Is this an in person or online group?</div>
                <select value={type} onChange={e => setType(e.target.value)}>
                    <option>Private</option>
                    <option>Public</option>
                </select>
                <div>Is this group private or public?</div>
                <select value={privatepublic} onChange={e => setPrivatePublic(e.target.value)}>
                    <option>Private</option>
                    <option>Public</option>
                </select>
                <div>Please add in image url for your group below:</div>
                <input type="text" name="url" placeholder="https://somewhere.com/image.gif"
                    value={url} onChange={e => setUrl(e.target.value)}
                />
            </div>

            <button type="submit" disabled={Object.keys(validationErrors).length !== 0}>
                Create Group
            </button>




            {/* <div>blahblahblah</div>
            <select value={privatepublic} onChange={e => setPrivatePublic(e.target.value)}>
              <option>Private</option>
              <option>Public</option>
            </select>

          <label>
            Average Height (in meters)
            <input
              type="number"
              name="avgHeight"
              value={avgHeight}
              onChange={e => setAvgHeight(e.target.value)}
            />
          </label>
          <p className="errors">
            {
              validationErrors.avgHeight !== undefined
              && validationErrors.avgHeight
            }
          </p>
          <button
            type="submit"
            disabled={Object.keys(validationErrors).length !== 0}
          >
            Add Tree
          </button> */}
        </form>
      );
}

/*
{
  "name": "Evening Tennis on the Water",
  "about": "Enjoy rounds of tennis with a tight-nit group of people on the water facing the Brooklyn Bridge. Singles or doubles.",
  "type": "In person",
  "private": true,
  "city": "New York",
  "state": "NY",
}
*/
