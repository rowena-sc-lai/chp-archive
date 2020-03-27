#!/bin/sh
# Credit: https://gist.github.com/willprice/e07efd73fb7f13f917ea

setup_git() {
  git config --global user.email "travis@travis-ci.com"
  git config --global user.name "Travis CI"
}

commit_data() {
  git checkout master

  git status
  # Current month and year, e.g: Apr 2018
  dateAndMonth=`date "+%b %Y"`
  # Stage the modified files in dist/output
  git add -f data

  git add index.html
  # Create a new commit with a custom build message
  # with "[skip ci]" to avoid a build loop
  # and Travis build number for reference
  git commit -m "pushing new pdfs at $dateAndMonth (Build $TRAVIS_BUILD_NUMBER)" -m "[skip ci]"    

  git commit -m "Travis update checksum files: $dateAndMonth (Build $TRAVIS_BUILD_NUMBER)" -m "[skip ci]"
}

upload_files() {
  git remote add upstream https://nandiheath:${GH_TOKEN}@github.com/nandiheath/chp-archive.git > /dev/null 2>&1
  git push --quiet --set-upstream upstream master
}

setup_git

commit_data

# Attempt to commit to git only if "git commit" succeeded
if [ $? -eq 0 ]; then
  echo "A new commit with changed data/index.html . Uploading to GitHub"
  upload_files
else
  echo "No changes. Skip deploying"
fi