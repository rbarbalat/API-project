import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./EventForm.css";
import { thunkReceiveEvent } from "../../store/events";

export default function EventForm()
{
    //linked from Create event button on group details page, the group is the singleGroup in state
    const group = useSelector(state => state.groups.singleGroup);

    const [name, setName] = useState("");
    const [type, setType] = useState("(select one)");
    // const [privatepublic, setPrivatePublic]  = useState("(select one)");
    const [price, setPrice] = useState(0);
    //const [capacity, setCapacity] = useState(0);
    const capacity = 100;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [url, setUrl] = useState("");
    const [about, setAbout] = useState("");

    const [validationErrors, setValidationErrors] = useState({});
    const [displayErrors, setDisplayErrors] = useState(false);

    // at /groups/:groupId/events/new or get groupId from the group state
    //let {groupId} = useParams();
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

        if(startDate.length === 0)
        errors.startDate = "Event start is required";

        if(endDate.length === 0)
        errors.endDate = "Event end is required";

        let validEnding = false;
        url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") ?
        validEnding = true : validEnding = false;

        if(!validEnding) errors.url = "Image URL must end in .png, .jpg, or .jpeg"

        setValidationErrors(errors);
    }, [name, about, type, capacity, startDate, endDate,  url])

    function reset()
    {
        //might not need this function
        setName("");
        setAbout("");
        setPrice(0);
        setUrl("");
        setType("(select one)");

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
            const serverObject = await dispatch(thunkReceiveEvent(groupKey, {
                venueId: null,
                name,
                type,
                capacity: Number(capacity),//capacity hardcoded for now
                price: Number(price),
                description: about,
                startDate: new Date(startDate),
                endDate: new Date(startDate),
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
        if(sessionUser === null) return <div>unauthorized</div>;
        return (
            <form onSubmit={onSubmit} className="CreateEventForm">
            <div className="eventFormWrapper">

                <div className="eventFormHeader">Create an event for {group.name} </div>

                <div className="eventFormNameSection">
                        <div className="eventFormLabel">What is the name of your event?</div>
                        <input type="text" name="about" placeholder="Event Name"
                            value={name} onChange={e => setName(e.target.value)}
                            className="eventNameInput"
                        />
                        <p className="errors">
                        {
                            validationErrors.name !== undefined && displayErrors
                            && validationErrors.name
                        }
                        </p>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Is this an in person or online group?</div>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option>(select one)</option>
                            <option>Online</option>
                            <option>In person</option>
                        </select>
                        <p className="errors">
                        {
                            validationErrors.type !== undefined && displayErrors
                            && validationErrors.type
                        }
                        </p>
                    </div>

                    <div className="subSection">
                        <div className="eventFormLabel">What is the price of your event?</div>
                        <input type="text" name="price" placeholder="0"
                            value={price} onChange={e => setPrice(e.target.value)}
                            className="eventPriceInput"
                        />
                        <p className="errors">
                        {
                            validationErrors.price !== undefined && displayErrors
                            && validationErrors.price
                        }
                        </p>
                    </div>

                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">When does your event start?</div>
                        <input type="text" name="startDate" placeholder="MM/DDYYYY HH:mm AM"
                            value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="eventDateInput"
                        />
                        <p className="errors">
                        {
                            validationErrors.startDate !== undefined && displayErrors
                            && validationErrors.startDate
                        }
                        </p>
                    </div>

                    <div className="subSection">
                        <div className="eventFormLabel">When does your event end?</div>
                        <input type="text" name="endDate" placeholder="MM/DDYYYY HH:mm PM"
                            value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="eventDateInput"
                        />
                        <p className="errors">
                        {
                            validationErrors.endDate !== undefined && displayErrors
                            && validationErrors.endDate
                        }
                        </p>
                    </div>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Please add in image url for your event below:</div>
                        <input type="text" name="url" placeholder="Image URL"
                            value={url} onChange={e => setUrl(e.target.value)}
                            className="eventUrlInput"
                        />
                        <p className="errors">
                        {
                            validationErrors.url !== undefined && displayErrors
                            && validationErrors.url
                        }
                        </p>
                    </div>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Please describe your event:</div>
                        <textarea type="text" name="about" placeholder="Please include at least 30 characters?"
                            value={about} onChange={e => setAbout(e.target.value)}
                        />
                        <p className="errors">
                        {
                            validationErrors.about !== undefined && displayErrors
                            && validationErrors.about
                        }
                        </p>
                    </div>
                </div>

                <button type="submit">Create Event</button>

            </div>
            </form>
          );

}
