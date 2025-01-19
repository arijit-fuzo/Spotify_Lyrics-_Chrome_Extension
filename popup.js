document.addEventListener("DOMContentLoaded",function()
{
    let lric = document.getElementById("lyrix");
    let songName = document.getElementById("title");

    chrome.tabs.query(
        {active: true, currentWindow: true},function(tabs)
        {
            chrome.tabs.sendMessage(
                tabs[0].id,
                {type : "msg_from_popup"},
                function(response)
                {
                    console.log(response);
                    songName.innerHTML = response.nam;
                    lric.innerHTML = response.lyr.replace(/\n/g,"<br>");
                }
            )
        })
})