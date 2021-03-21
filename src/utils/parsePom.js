const pomParser = require("pom-parser");


const parsePom = (opts) =>
    new Promise(
        (resolve, reject) => {
            pomParser.parse(opts, function (err, pomResponse) {
                if (err) {
                    console.log("ERROR: " + err);
                    reject()
                    return;
                }

                let mvnDependencies = {}

                const parseDep = ({ groupid: groupId, scope, version, artifactid: artifactId }) => {
                    if (groupId !== "org.jolie-lang" && !["test", "compile"].includes(scope)) {
                        mvnDependencies[`${groupId}:${artifactId}`] = version
                    }
                }
                const { dependencies } = pomResponse.pomObject.project

                if (dependencies) {
                    const { dependency } = dependencies

                    dependency.hasOwnProperty("length")
                        ? dependencies.dependency.forEach(parseDep)
                        : parseDep(dependencies.dependency)
                }

                resolve(mvnDependencies)

            })
        }
    );


module.exports = { parsePom }