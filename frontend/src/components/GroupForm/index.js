import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./GroupForm.css";
import { thunkReceiveGroup } from "../../store/groups";


export default function GroupForm({formType})
{
    console.log(formType);
    const [name, setName] = useState("");
    const [about, setAbout] = useState("");
    const [type, setType] = useState("(select one)");
    const [privatepublic, setPrivatePublic]  = useState("(select one)");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [url, setUrl] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [displayErrors, setDisplayErrors] = useState(false);

    const history = useHistory();
    const dispatch = useDispatch();

    const sessionUser = useSelector((state) => state.session.user);

    //const alphabet = "abcdefghijklmnopqrstywzABCDEFGHIJKLMNOPQRSTYZ";
    useEffect(() => {
        const errors = {};
        // if str === "", then str[0] is undefined, remember for strings that
        //spaces

        if(city.length === 0)
        errors.city = "City is required";

        if(state.length === 0)
        errors.state = "State is required"

        //the backend validation is < 50, need to change backend?
        if(about.length < 30)
        errors.about = "Description must be at least 30 characters long";

        if(!["Online", "In person"].includes(type))
        errors.type = "Group Type is required";

        if(!["Private", "Public"].includes(privatepublic))
        errors.privatepublic = "Visibility Type is required";

        let validEnding = false;
        url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") ?
        validEnding = true : validEnding = false;

        if(!validEnding) errors.url = "Image URL must end in .png, .jpg, or .jpeg"

        setValidationErrors(errors);
    }, [name, about, type, privatepublic, city, state, url])

    function reset()
    {
        //might not need this function
        setName("");
        setAbout("");
        setCity("");
        setState("");
        setUrl("");
        setType("(select one)");
        setPrivatePublic("(select one)");
        setDisplayErrors(false);
        setValidationErrors({});
    }

    async function onSubmit(event)
    {
        event.preventDefault();
        //console.log("hello world");
        if(Object.keys(validationErrors).length !== 0)
        {
            setDisplayErrors(true);
        }else{
            if(formType === "Create")
            {
                const Organizer = {
                    id: sessionUser.id,
                    firstName: sessionUser.firstName,
                    lastName: sessionUser.lastName
                };
                const serverObject = await dispatch(thunkReceiveGroup(Organizer, {
                    name,
                    about,
                    type,
                    private: privatepublic === "Private" ? true : false,
                    city,
                    state,
                    url
                }));
                if(serverObject.errors === undefined)
                {
                    const newId = serverObject.id;
                    //maybe not necessary to reset since going to new page
                    reset();
                    history.push(`/groups/${newId}`);
                    return;
                }
                setDisplayErrors(true);
                setValidationErrors(serverObject.errors);
            }
            if(formType === "Update")
            {
                const Organizer = {
                    id: sessionUser.id,
                    firstName: sessionUser.firstName,
                    lastName: sessionUser.lastName
                };
                const serverObject = await dispatch(thunkReceiveGroup(Organizer, {
                    name,
                    about,
                    type,
                    private: privatepublic === "Private" ? true : false,
                    city,
                    state,
                    //url
                }));
                if(serverObject.errors === undefined)
                {
                    const newId = serverObject.id;
                    //maybe not necessary to reset since going to new page
                    reset();
                    history.push(`/groups/${newId}`);
                    return;
                }
                setDisplayErrors(true);
                setValidationErrors(serverObject.errors);
            }
        }
    }
    if(formType === "edit") return null;
    //for now, adjust when adding links to this page (only available to logged in users)
    if(sessionUser === null) return null;
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
                    validationErrors.city !== undefined && displayErrors
                    && validationErrors.city
                    }
                </div>
                <input type="text" name="state" placeholder="State"
                    value={state} onChange={e => setState(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.state !== undefined && displayErrors
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
                    validationErrors.name !== undefined && displayErrors
                    && validationErrors.name
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
                <textarea type="text" name="about" placeholder="Please write at least 30 characters?"
                    value={about} onChange={e => setAbout(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.about !== undefined && displayErrors
                    && validationErrors.about
                    }
                </div>
            </div>

            <div>
                <div>Final Steps...</div>
                <div>Is this an in person or online group?</div>
                <select value={type} onChange={e => setType(e.target.value)}>
                    {/* //change to a default value that is not an option */}
                    <option>(select one)</option>
                    <option>Online</option>
                    <option>In person</option>
                </select>

                <div className="errors">
                    {
                    validationErrors.type !== undefined && displayErrors
                    && validationErrors.type
                    }
                </div>

                <div>Is this group private or public?</div>
                <select value={privatepublic} onChange={e => setPrivatePublic(e.target.value)}>
                    <option>(select one)</option>
                    <option>Private</option>
                    <option>Public</option>
                </select>

                <div className="errors">
                    {
                    validationErrors.privatepublic !== undefined && displayErrors
                    && validationErrors.privatepublic
                    }
                </div>


                <div>Please add in image url for your group below:</div>
                <input type="text" name="url" placeholder="https://somewhere.com/image.gif"
                    value={url} onChange={e => setUrl(e.target.value)}
                />
                <div className="errors">
                    {
                    validationErrors.url !== undefined && displayErrors
                    && validationErrors.url
                    }
                </div>
            </div>
            <button type="submit">
                Create Group
            </button>
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
