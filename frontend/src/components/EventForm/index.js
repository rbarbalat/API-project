import { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FileInput from "../FileInput";
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

    const [image, setImage] = useState("");
    // const url = create || emptyGroup ? "" : group.EventImages[0].url;
    const image_file = useRef(null);

    const [about, setAbout] = useState("");

    const [validationErrors, setValidationErrors] = useState({});
    const [displayErrors, setDisplayErrors] = useState(false);

    // at /groups/:groupId/events/new or get groupId from the group state
    //let {groupId} = useParams();
    const history = useHistory();
    const dispatch = useDispatch();

    //must be organizer but only organizer should be allowed to click
    const sessionUser = useSelector((state) => state.session.user);

    function updateFile(e)
    {
        // const file = e.target.files[0];
        // if (file) setImage(file);
        setImage(e.target.files[0]);
        const errors = {...validationErrors};
        delete errors.image;
        setValidationErrors(errors);
    }

    useEffect(() => {
        const errors = {};

        if(name.trim().length === 0 || name.length === 0)
        errors.name = "Name is required";

        if(Number(price) < 0)
        errors.price = "Price can't be lower than zero";

        if(Number(price) != price)
        errors.price = "Price must be a number";

        if(price.length === 0)
        errors.price = "Price is required";

        if(about.trim().length < 30 || about.length < 30)
        errors.about = "Description must be at least 30 characters long";

        if(!["Online", "In person"].includes(type))
        errors.type = "Group Type is required";

        let date = new Date(startDate);
        console.log("startDate, ", date.toString());
        if(date.toString() === "Invalid Date")
        errors.startDate = "Invalid Start Date";

        date = new Date(endDate);
        if(date.toString() === "Invalid Date")
        errors.endDate = "Invalid End Date";

        if(!image)
        errors.image = "Image File is required";

        setValidationErrors(errors);
    }, [name, about, type, price, startDate, endDate, image])

    function reset()
    {
        //might not need this function
        setName("");
        setAbout("");
        setPrice(0);
        setType("(select one)");
        setStartDate("");
        setEndDate("");
        setImage("");

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
                startDate: new Date(startDate),
                endDate: new Date(endDate)
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
                {validationErrors.image && displayErrors && <div className="errors">{validationErrors.image}</div>}
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
                        <input type="text" name="startDate" placeholder="MM/DD/YYYY HH:mm AM"
                            value={startDate} onChange={e => setStartDate(e.target.value)}
                            className="eventDateInput eventStartInput"
                        />
                    </div>

                    <div className="subSection">
                        <div className="eventFormLabel">When does your event end?</div>
                        <input type="text" name="endDate" placeholder="MM/DD/YYYY HH:mm PM"
                            value={endDate} onChange={e => setEndDate(e.target.value)}
                            className="eventDateInput"
                        />
                    </div>
                </div>

                <div className="eventFormSection">
                    <div className="subSection">
                        <div className="eventFormLabel">Please add in image url for your event below:</div>
                        <input type="file" accept="image/*" onChange={updateFile}
                         ref = {image_file} style = {{display: "none"}} />
                        <FileInput url={null} image={image} upload = {() => image_file.current.click()} />
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
