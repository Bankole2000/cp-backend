#### What does this PR do?

*

#### Description of Task to be completed?

* [ ]

```bash
# Keywords: close, closes, closed, fix, fixes, fixed, resolve, resolves, resolved,
# e.g. closes #issueNo
```

#### How can this be manually tested?

After cloning the repo, `cd` into it and do the following:

```bash
# Run the entire application locally
$ lerna exec npm run dev

# Run only the backend api
$ lerna exec --parallel --ignore cribplug npm run dev
```

After services are started, check sample services are running on specified ports (e.g. auth service on port 7700) e.g `localhost:7700/api/v1/auth/test`,

#### Any background context you want to provide?

N/a

#### What are the relevant issues/tickets?

N/a

#### Screenshots (if appropriate)

N/a
