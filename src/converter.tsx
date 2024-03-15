const convertNaturalToLatex = async (prompt: string): Promise<string> => {
    const myHeaders = new Headers();
    myHeaders.append("User-Agent", "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0");
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept-Language", "en-US,en;q=0.5");
    myHeaders.append("Accept-Encoding", "gzip, deflate, br");
    myHeaders.append("Referer", "https://www.text2latex.com/");
    myHeaders.append("content-type", "application/json");
    myHeaders.append("Origin", "https://www.text2latex.com");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Cookie", "ph_phc_gnJxS3xB23ajulr5CYQa08YAgf4h3KitxW4wuwbpGdX_posthog=%7B%22distinct_id%22%3A%22018e35a9-ffcd-713e-bd7a-95c7a05ffa23%22%2C%22%24sesid%22%3A%5B1710297703450%2C%22018e35a9-ffce-7130-b9d4-a1dd0c829b7f%22%2C1710297317326%5D%7D");
    myHeaders.append("Sec-Fetch-Dest", "empty");
    myHeaders.append("Sec-Fetch-Mode", "no-cors");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Pragma", "no-cache");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.append("TE", "trailers");

    const raw = JSON.stringify({prompt})

    const response = await fetch("https://www.text2latex.com/api", {
        method: "POST",
        headers: myHeaders,
        body: raw
    })

    const message = await response.json() as {data: string}

    return message.data
}


export {convertNaturalToLatex}