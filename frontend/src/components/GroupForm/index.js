import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./GroupForm.css";
import { thunkReceiveGroup } from "../../store/groups";


export default function GroupForm({formType})
{
    const create = (formType === "Create");
    //on updates, the singleGroup in the store holds current group data
    const group = useSelector(state => state.groups.singleGroup);
    const [name, setName] = useState(create ? "" : group.name);
    const [about, setAbout] = useState(create ? "" : group.about);
    const [type, setType] = useState(create ? "(select one)" : group.type);
    const [privatepublic, setPrivatePublic]  = useState(create ? "(select one)" : (group.private === true ? "Private" : "Public"));
    const [city, setCity] = useState(create ? "" : group.city);
    const [state, setState] = useState(create ? "" : group.state);
    const [url, setUrl] = useState("");
    const [validationErrors, setValidationErrors] = useState({});
    const [displayErrors, setDisplayErrors] = useState(false);

    let {groupId} = useParams();
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

        if(name.length === 0)
        errors.name = "Name is required"

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

        if(!validEnding && create) errors.url = "Image URL must end in .png, .jpg, or .jpeg"

        setValidationErrors(errors);
    }, [name, about, type, privatepublic, city, state, url, create])

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
        if(Object.keys(validationErrors).length !== 0)
        {
            setDisplayErrors(true);
        }else{
            //get rid of if statements and set all values with ternaries, create ?
            if(create === true)
            {
                //may have accidnetially changed osmething here double check this
                const Organizer = {
                    id: sessionUser.id,
                    firstName: sessionUser.firstName,
                    lastName: sessionUser.lastName
                };
                groupId = null;
                const serverObject = await dispatch(thunkReceiveGroup(Organizer, create, groupId, {
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
            if(create === false)
            {
                const Organizer = null;
                const serverObject = await dispatch(thunkReceiveGroup(Organizer, create, groupId, {
                    name,
                    about,
                    type,
                    private: privatepublic === "Private" ? true : false,
                    city,
                    state
                    //url
                }));
                if(serverObject.errors === undefined)
                {
                    const newId = serverObject.id;
                    reset();
                    history.push(`/groups/${newId}`);
                    return;
                }
                setDisplayErrors(true);
                setValidationErrors(serverObject.errors);
            }
        }
    }
    const topSection = create ?
    (<div className="groupFormHeader">
        <div className="startOrUpdate">START A NEW GROUP</div>
        <div className="formSectionHeader">We'll walk you through a few steps to build your local community</div>
    </div>)
    :
    (<div className="groupFormHeader">
        <div className="startOrUpdate">UPDATE YOUR GROUP'S INFORMATION</div>
        <div className="formSectionHeader">We'll walk you through a few steps to update your group's information</div>
    </div>)

    const urlSection = create ?
    ( <div>
        <div className="urlLabel">Please add in image url for your group below:</div>
        <input className="urlInput" type="text" name="url" placeholder="Image Url"
            value={url} onChange={e => setUrl(e.target.value)}
        />
        <p className="errors">
        {
            validationErrors.url !== undefined && displayErrors
            && validationErrors.url
        }
        </p>
    </div>)
    :
    (<div></div>);

    //for now, adjust when adding links to this page (only available to logged in users)
    if(sessionUser === null) return null;
    return (
        <form onSubmit={onSubmit} className={formType === "create" ? "createGroupForm" : "editGroupForm"}>
            <div className="groupFormWrapper">
                {topSection}
                <div className="groupFormLocation formSection">
                    <div id="setLocation" className="formSectionHeader">First, set your group's location</div>
                    <div className="formLabel">Meetup groups meet locally, in person and online.  We'll connect you with people in your area, and more can join you online</div>
                    <input type="text" name="city" placeholder="City"
                        value={city} onChange={e => setCity(e.target.value)}
                    />
                    <p className="errors">
                    {
                        validationErrors.city !== undefined && displayErrors
                        && validationErrors.city
                    }
                    </p>
                    <input type="text" name="state" placeholder="State"
                        value={state} onChange={e => setState(e.target.value)}
                    />
                    <p className="errors">
                    {
                        validationErrors.state !== undefined && displayErrors
                        && validationErrors.state
                    }
                    </p>
                </div>

                <div className="groupFormName formSection">
                    <div id="setName" className="formSectionHeader">What will your group's name be?</div>
                    <div className="formLabel">Choose a name that will give people a clear idea of what the group is about.  Feel free to get creative!  You can edit this later if you change your mind</div>
                    <input type="text" name="about" placeholder="What is your group's name?"
                        value={name} onChange={e => setName(e.target.value)}
                    />
                    <p className="errors">
                    {
                        validationErrors.name !== undefined && displayErrors
                        && validationErrors.name
                    }
                    </p>
                </div>

                <div className="groupFormAbout formSection">
                    <div id="setDescription" className="formSectionHeader">Now describe what your group will be about</div>
                    <div className="formLabel"> People will this when we promote your group, but you'll be able to add to it later</div>
                    <ol>
                        <li>What's the purpose of your group?</li>
                        <li>Who sould join?</li>
                        <li>What will you do at your events??</li>
                    </ol>

                    <textarea type="text" name="about" placeholder="Please write at least 30 characters?"
                        value={about} onChange={e => setAbout(e.target.value)}
                    />
                    <p className="errors">
                    {
                        validationErrors.about !== undefined && displayErrors
                        && validationErrors.about
                    }
                    </p>
                </div>

                <div className="groupFormBottom formSection">
                    <div id="Final" className="formSectionHeader">Final Steps...</div>

                    <div className="formLabelBottom">Is this an in person or online group?</div>
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option>(select one)</option>
                        <option>Online</option>
                        <option>In person</option>
                    </select>

                    <p className="errors typeVis">
                    {
                        validationErrors.type !== undefined && displayErrors
                        && validationErrors.type
                    }
                    </p>

                    <div className="formLabelBottom">Is this group private or public?</div>
                    <select value={privatepublic} onChange={e => setPrivatePublic(e.target.value)}>
                        <option>(select one)</option>
                        <option>Private</option>
                        <option>Public</option>
                    </select>

                    <p className="errors typeVis">
                    {
                        validationErrors.privatepublic !== undefined && displayErrors
                        && validationErrors.privatepublic
                    }
                    </p>

                    {urlSection}

                </div>

                <div id="groupFormButton" className="formSection">
                    <button type="submit"> {create ? "Create Group" : "Update Group"}</button>
                </div>

        </div>

        </form>
    );

}
