<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# jacoco-reporter

Add JaCoCo test results in the push and pull request events.

## Usage
### Inputs

- `report-paths` - [**required**] comma-separated list of JaCoCo report paths
- `min-overall-instructions-coverage` - [**optional**, default: 0] minimum required for INSTRUCTION coverage for the project, both average and per file
- `min-overall-branch-coverage` - [**optional**, default: 0] minimum required for BRANCH coverage for the project, both average and per file
- `min-modified-files-instructions-coverage` - [**optional**, default: 0] minimum required for INSTRUCTION coverage for the modified files, both average and per file
- `min-modified-files-branch-coverage` - [**optional**, default: 0] minimum required for BRANCH coverage for the modified files, both average and per file
- `pull-request-title` - [**optional**, default: ''] title of the pull request comment to be made
- `update-previous-comment` - [**optional**, default: false] whether to update the previous comment or not; this takes higher precendence than delete-previous-comment option
- `delete-previous-comment` - [**optional**, default: false] whether to delete the previous comment or not
- `github-token` - [**required**] token to use to be used for GitHub API

### Outputs

- `overall-instructions-coverage` - the overall coverage of the project for _INSTRUCTIONS_ counter
- `overall-branch-coverage` - the overall coverage of the project for _BRANCH_ counter
- `modified-files-instructions-coverage` - the overall coverage of the modified files for _INSTRUCTIONS_ counter
- `modified-files-branch-coverage` - the overall coverage of the modified files for _BRANCH_ counter


### Example Workflow

```yaml
name: Jacoco Code Coverage

on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out Code
        uses: actions/checkout@v3

      - name: Set up JDK 17.0
        uses: actions/setup-java@v3
        with:
          distribution: "corretto"
          java-version: 17.0
          cache: "gradle"

      - name: Run Coverage
        run: |
          chmod +x gradlew
          ./gradlew jacocoTestReport

      - name: Add coverage to PR
        id: jacoco
        uses: juliusiglesia/jacoco-reporter@v1.0
        with:
          report-paths: ${{ github.workspace }}/build/reports/jacoco/test/jacocoTestReport.xml
          github-token: ${{ secrets.GITHUB_TOKEN }}
          min-overall-instructions-coverage: 50
          min-overall-branch-coverage: 50
          min-modified-files-instructions-coverage: 70
          min-modified-files-branch-coverage: 70
```

## Development

> &nbsp;
> 
> **Prerequisistes:**
> 1. node v16+
> 
> &nbsp;


Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

Auto-fix linting issues :heavy_check_mark:  
```bash
$ npm run format
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
