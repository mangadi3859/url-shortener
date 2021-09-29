const table = document.querySelector("[data-table-body]");

getShorts().then((res) => {
    res.forEach((short, i) => {
        let tr = document.createElement("tr");
        let no = document.createElement("td");
        let id = document.createElement("td");
        let a1 = document.createElement("a");
        let url = document.createElement("td");
        let a2 = document.createElement("a");
        let view = document.createElement("td");

        no.innerText = i + 1;
        a1.innerText = short.id;
        a1.href = "/short/" + short.id;
        id.appendChild(a1);
        a2.innerText = short.url;
        a2.href = short.url;
        url.appendChild(a2);
        view.innerText = short.views;
        tr.append(no, url, id, view);
        table.appendChild(tr);
    });
});

async function getShorts() {
    let data = await fetch("/api/shorts");
    let json = await data.json();

    return json;
}
