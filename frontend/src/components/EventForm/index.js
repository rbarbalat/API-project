import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./EventForm.css";
import { thunkReceiveEvent } from "../../store/events";

export default function EventForm()
{
    //linked from Create event button on group details page, the group is the singleGroup in state
    const group = useSelector(state => state.groups.singleGroup);

    const [name, setName] = useState("");
    const [type, setType] = useState("(select one)");
    const [privatepublic, setPrivatePublic]  = useState("(select one)");
    const [price, setPrice] = useState(0);
    const [capacity, setCapacity] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [url, setUrl] = useState("");
    const [about, setAbout] = useState("");

    const [validationErrors, setValidationErrors] = useState({});
    const [displayErrors, setDisplayErrors] = useState(false);

    // at /groups/:groupId/events/new or get groupId from the group state
    let {groupId} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    //must be organizer but only organizer should be allowed to click
    const sessionUser = useSelector((state) => state.session.user);

    //const alphabet = "abcdefghijklmnopqrstywzABCDEFGHIJKLMNOPQRSTYZ";
    useEffect(() => {
        const errors = {};

        if(name.length === 0)
        errors.name = "Name is required";

        //the backend validation is < 50, need to change backend?
        if(about.length < 30)
        errors.about = "Description must be at least 30 characters long";

        if(!["Online", "In person"].includes(type))
        errors.type = "Group Type is required";

        if(!["Private", "Public"].includes(privatepublic))
        errors.privatepublic = "Visibility Type is required";

        if(capacity === 0)
        errors.capacity = "Capacity is required";

        if(startDate.length === 0)
        errors.startDate = "Event start is required";

        if(endDate.length === 0)
        errors.endDate = "Event end is required";

        let validEnding = false;
        url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") ?
        validEnding = true : validEnding = false;

        if(!validEnding) errors.url = "Image URL must end in .png, .jpg, or .jpeg"

        setValidationErrors(errors);
    }, [name, about, type, privatepublic, capacity, startDate, endDate,  url])

    function reset()
    {
        //might not need this function
        setName("");
        setAbout("");
        setPrice(0);
        setCapacity("");
        setUrl("");
        setType("(select one)");
        setPrivatePublic("(select one)");

        setDisplayErrors(false);
        setValidationErrors({});
    }

    async function onSubmit(e)
    {
        e.preventDefault();
        if(Object.keys(validationErrors).length !== 0)
        {
            setDisplayErrors(true);
        }else{
            const groupKey = {
                id: group.id,
                name: group.name,
                private: group.private,
                city: group.city,
                state: group.state
            };
            const priv = privatepublic === "Private" ? true : false;
            const serverObject = await dispatch(thunkReceiveEvent(groupKey, priv, {
                venueId: null,
                name,
                type,
                capacity: Number(capacity),
                price: Number(price),
                description: about,
                startDate: new Date(startDate),
                endDate: new Date(startDate),
                //private: privatepublic === "Private" ? true : false,
                url
            }));
            if(serverObject.errors === undefined)
            {
                const newId = serverObject.id;
                //maybe not necessary to reset since going to new page
                reset();
                history.push(`/events/${newId}`);
                return;
            }
            setDisplayErrors(true);
            setValidationErrors(serverObject.errors);
        }
    }

        //for now, adjust when adding links to this page (only available to logged in users)
        if(sessionUser === null) return null;
        return (
            <form onSubmit={onSubmit} className="CreateEventForm">
                <div>Create an event for {group.name} </div>

                <div>
                    <div>What is the name of your event?</div>
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
                    <div>Is this an in person or online event?</div>
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
                </div>

                <div>
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
                </div>

                <div>
                    <div>What is the price of your event?</div>
                    <input type="text" name="price" placeholder="0"
                        value={price} onChange={e => setPrice(e.target.value)}
                    />
                    <div className="errors">
                        {
                        validationErrors.price !== undefined && displayErrors
                        && validationErrors.price
                        }
                    </div>
                </div>

                <div>
                    <div>What is the capacity of your event?</div>
                    <input type="text" name="capacity" placeholder="0"
                        value={capacity} onChange={e => setCapacity(e.target.value)}
                    />
                    <div className="errors">
                        {
                        validationErrors.capacity !== undefined && displayErrors
                        && validationErrors.capacity
                        }
                    </div>
                </div>

                <div>
                    <div>When does your event start?</div>
                    <input type="text" name="startDate" placeholder="MM/DDYYYY HH:MM PM"
                        value={startDate} onChange={e => setStartDate(e.target.value)}
                    />
                    <div className="errors">
                        {
                        validationErrors.startDate !== undefined && displayErrors
                        && validationErrors.startDate
                        }
                    </div>
                </div>

                <div>
                    <div>When does your event end?</div>
                    <input type="text" name="endDate" placeholder="MM/DDYYYY HH:MM PM"
                        value={endDate} onChange={e => setEndDate(e.target.value)}
                    />
                    <div className="errors">
                        {
                        validationErrors.endDate !== undefined && displayErrors
                        && validationErrors.endDate
                        }
                    </div>
                </div>

                <div>
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

                <div>
                    <div>Please describe your event:</div>
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

                <button type="submit">Create Event</button>
            </form>
          );

}
