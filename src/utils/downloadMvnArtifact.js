const fetch = require("node-fetch")
const fs = require("fs-extra")
const path = require("path")

const filename =
    ({ artifactId, version }) =>
        `${artifactId}-${version}.jar`

const pomName =
    ({ artifactId, version }) =>
        `${artifactId}-${version}.pom`

const groupPath =
    ({ groupId, artifactId, version }) =>
        `${groupId.replace(/\./g, '/')}/${artifactId}/${version}`

const makeArtifactPomUrl =
    (artifact) =>
        `https://repo1.maven.org/maven2/${groupPath(artifact)}/${pomName(artifact)}`;


const makeArtifactUrl =
    (artifact) =>
        `https://repo1.maven.org/maven2/${groupPath(artifact)}/${filename(artifact)}`;

const lib = "./lib/"

const downloadMvnArtifact = async (artifact) => {
    const artifactUrl = makeArtifactUrl(artifact)
    const res = await fetch(artifactUrl)

    if (res.status === 404)
        throw new Error(`Artifact ${artifact.groupId}:${artifact.artifactId}, version ${artifact.version} not found @ Maven`)
    else if (!res.ok)
        throw new Error("Error connecting to Maven")

    return new Promise((resolve, reject) => {
        !fs.existsSync(lib) && fs.mkdirSync(lib)

        const artifactPath = path.join(lib, filename(artifact))
        const fileStream = fs.createWriteStream(artifactPath)

        res.body.pipe(fileStream);
        res.body.on("error", (err) => {
            reject(err);
        });
        fileStream.on("finish", function () {
            resolve();
        });
    })
}

module.exports = { downloadMvnArtifact, makeArtifactPomUrl }