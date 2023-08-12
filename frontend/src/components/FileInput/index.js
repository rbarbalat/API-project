
import "./FileInput.css";
export default function FileInput( {url, image, upload} )
{
    return (
        <p className="image_and_upload_button">
            <i className={image ? "fa-solid fa-pen-to-square" : "fa-solid fa-upload"} onClick = {upload}></i>
        {
            url && <img alt={"group preview"} className={ image ? "form_image hidden" : "form_image"} src={url}></img>
        }
        </p>
    )
}
