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
    const [price, setPrice] = useState("");
    const capacity = 100;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [url, setUrl] = useState("");
    const [image, setImage] = useState(null);

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

    //input format is MM/DD/YYYY, HH/mm AM(orPM)
    //converting MM/DD/YYYY, HH/mm where HH is from 00 to 24
    function reformatDateString(date)
    {
        let AMPM = date.slice(-3);
        let newDate = date.slice(0, -3); //remove space and AM or PM
        newDate = newDate.slice(0,-3) + ":" + newDate.slice(-2);//replace slash with :
        return newDate;
    }
    function adjustForPM(date)
    {
        let hour = String(Number(date.slice(11,13)) + 12);
        let newDate = date.slice(0, 11) + hour +  date.slice(13);
        return newDate;
    }
    function updateFile(e)
    {
        const file = e.target.files[0];
        if (file) setImage(file);
    }

    useEffect(() => {
        const errors = {};

        if(name.trim().length === 0 || name.length === 0)
        errors.name = "Name is required";

        if(Number(price) < 0)
        errors.price = "Price can't be lower than zero";

        if(Number(price) != price)
        errors.price = "Price must be a number";
        // console.log("Number(price) ", Number(price));
        // console.log("price ", price)

        if(price.length === 0)
        errors.price = "Price is required";

        //the backend validation is < 50, need to change backend?
        if(about.trim().length < 30 || about.length < 30)
        errors.about = "Description must be at least 30 characters long";

        if(!["Online", "In person"].includes(type))
        errors.type = "Group Type is required";

        //input format is MM/DD/YYYY, HH/mm AM(orPM)
        //convert into acceptable format, if it becomes an invalid
        //Date object then didn't start with the right format

        let AMPM = startDate.slice(-3);
        let start = reformatDateString(startDate);
        const validStart = new Date(start).toString();
        if(validStart === "Invalid Date" || (AMPM !== " AM" && AMPM !== " PM"))
        {
            errors.startDate = "Start date is invalid";
        }
        else if( Number(start.slice(-5,-3)) > 12 || Number(start.slice(-5,-3)) === 0 ) {
            errors.startDate = "Start date is invalid"
        }

        AMPM = endDate.slice(-3);
        let end = reformatDateString(endDate);
        //valid end before accounting for something > 12 like 16:00 AM
        const validEnd = new Date(end).toString();
        if(validEnd === "Invalid Date" || (AMPM !== " AM" && AMPM !== " PM"))
        {
            errors.endDate = "End date is invalid";
        }else if( Number(end.slice(-5,-3)) > 12 || Number(end.slice(-5,-3)) === 0 ){
            errors.endDate = "End date is invalid"
        }

        // let validEnding = false;
        // url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") ?
        // validEnding = true : validEnding = false;
        // if(!validEnding) errors.url = "Image URL must end in .png, .jpg, or .jpeg"

        // if(url.trim().length === 0 || url.length === 0)
        // errors.url = "Image Url is required";

        setValidationErrors(errors);
    }, [name, about, type, price, startDate, endDate,  url])

    function reset()
    {
        //might not need this function
        setName("");
        setAbout("");
        setPrice(0);
        setUrl("");
        setType("(select one)");
        setStartDate("");
        setEndDate("");
        setImage(null);

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

            let start = reformatDateString(startDate);
            let end = reformatDateString(endDate);
            if(startDate.slice(-2) === "PM") start = adjustForPM(start);
            if(endDate.slice(-2) === "PM") end = adjustForPM(end);

            const formData = new FormData();
            formData.append("preview", true);
            if(image) formData.append("image", image);

            const serverObject = await dispatch(thunkReceiveEvent(groupKey, {
                venueId: null,
                name,
                type,
                capacity: Number(capacity),//capacity hardcoded for now
                price: Number(price),
                description: about,
                startDate: new Date(new Date(start) + "UTC"),
                endDate: new Date(new Date(end) + "UTC")
                //url
            }, formData));
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
                {validationErrors.name && displayErrors && <div className="errors">{validationErrors.name}</div>}
                {validationErrors.type && displayErrors && <div className="errors">{validationErrors.type}</div>}
                {validationErrors.price && displayErrors && <div className="errors">{validationErrors.price}</div>}
                {validationErrors.startDate && displayErrors && <div className="errors">{validationErrors.startDate}</div>}
                {validationErrors.endDate && displayErrors && <div className="errors">{validationErrors.endDate}</div>}
                {validationErrors.url && displayErrors && <div className="errors">{validationErrors.url}</div>}
                {validationErrors.about && displayErrors && <div className="errors">{validationErrors.about}</div>}

                <div className="eventFormHeader">Create an event for {group.name} </div>

                <div className="eventFormNameSection">
                        <div className="eventFormLabel">What is the name of your event?</div>
                        <input type="text" name="about" placeholder="Event Name"
                            value={name} onChange={e => setName(e.target.value)}
                            className="eventNameInput"
                        />
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Is this an in person or online group?</div>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option>(select one)</option>
                            <option>Online</option>
                            <option>In person</option>
                        </select>
                    </div>

                    <div className="subSection">
                        <div className="eventFormLabel">What is the price of your event?</div>
                        <div className="inputAndIcon">
                            {/* <i id="eventDollar" className="fa-solid fa-dollar-sign"></i> */}
                            <input type="text" name="price" placeholder="0"
                                value={price} onChange={e => setPrice(e.target.value)}
                                className="eventPriceInput"
                            />
                        </div>
                    </div>

                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">When does your event start?</div>
                        <input type="text" name="startDate" placeholder="MM/DD/YYYY, HH/mm AM"
                            value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="eventDateInput eventStartInput"
                        />
                    </div>

                    <div className="subSection">
                        <div className="eventFormLabel">When does your event end?</div>
                        <input type="text" name="endDate" placeholder="MM/DD/YYYY, HH/mm PM"
                            value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="eventDateInput"
                        />
                    </div>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Please add in image url for your event below:</div>
                        {/* <input type="text" name="url" placeholder="Image URL"
                            value={url} onChange={e => setUrl(e.target.value)}
                            className="eventUrlInput"
                        /> */}
                        <input type="file" onChange={updateFile} />
                    </div>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Please describe your event:</div>
                        <textarea type="text" name="about" placeholder="Please include at least 30 characters?"
                            value={about} onChange={e => setAbout(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit">Create Event</button>

            </div>
            </form>
          );

}
