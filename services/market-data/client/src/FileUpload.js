import {uploadImage} from "./api";

const FileUpload = ({symbol, updateLogoUrl}) => {
    let inputElement;

    const changeHandler = async (event) => {
        if (event.target.files[0] === undefined) return
        const formData = new FormData();
        formData.append('new-security-image', event.target.files[0]);
        const response = await uploadImage(formData, symbol);
        updateLogoUrl(response.imageMeta.url)
    };

    const handleClick = (e) => {
        e.preventDefault();
        inputElement.click();
    }

    return (
        <div>
            <input
                type="file"
                name="new-security-image"
                onChange={changeHandler}
                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                hidden
                style={{
                    display: 'none'
                }}
                ref={input => inputElement = input}
            />
            <button
                type="button"
                className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleClick}
            >
                Upload
            </button>
        </div>
    )
}

export default FileUpload