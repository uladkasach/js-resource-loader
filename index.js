var load_resources = async function(path, extraction_list){
    // normalize options
    if(typeof extraction_list == "string") var originally_requested_string = true;
    if(typeof extraction_list == "string") extraction_list = [extraction_list];

    // build iframe - in which the content will be loaded so as to not pollute scope
    console.log("creating frame");
    var frame = await promise_to_create_frame();

    // load the script into the document
    console.log("loading into frame");
    var frame_document = frame.contentWindow.document;
    await promise_to_load_script_into_document(path, frame_document);

    // extract the requested data
    console.log("Extracting ");
    var resources = [];
    extraction_list.forEach((key)=>{
        var resource = frame.contentWindow[key];
        resources.push(resource);
    })

    // return requested data
    if(originally_requested_string === true) return resources[0];
    return resources;
}
module.exports = load_resources;

var root_window = (typeof window.root_window == "object") window.root_window : window; // reach the root window if being used in the clientside-rquire contenxt
var promise_to_create_frame = function(){
    return new Promise((resolve, reject)=>{
        var frame = root_window.document.createElement('iframe'); // always create the iframe in the root document
        frame.onload = function(){resolve(frame)};
        frame.style.display = "none"; // dont display the iframe
        root_window.document.querySelector("html").appendChild(frame); // stick the document in the html element
    })
}
var promise_to_load_script_into_document = function(script_src, target_document){
    if(typeof target_document == "undefined") target_document = window.document; // if no document is specified, assume its the window's document
    var loading_promise = new Promise((resolve, reject)=>{
        var script = target_document.createElement('script');
        script.setAttribute("src", script_src);
        script.onload = function(){
            resolve(target_document);
        };
        script.onerror = function(error){
            reject(error);
        }
        target_document.getElementsByTagName('head')[0].appendChild(script);
    })
    return loading_promise;
}
