#!/bin/bash
#
# Build step to package artifacts into various release files
#
# Expects to be ran from within the project directory

##
# Check if this checkout is currently a tag, will echo 1 if tag, 0 if a branch
checkIsTag() {
  if [ -n "$(git status | egrep '^HEAD detached at v[0-9\.]+')" ]; then
    echo -n 1
  else
    echo -n 0
  fi
}

##
# Get the version for this tag, or git-DATE
getTagVersion() {
  if [ $(checkIsTag) -eq 1 ]; then
    git status | egrep '^HEAD' | sed 's:.*v\(.*\)$:\1:'
  else
    echo -n "git-$(date +%Y%m%d)"
  fi
}

# Create the archive
TGZ_FILE="cmsjs-$(getTagVersion).tgz"
echo "Creating tarball ${TGZ_FILE}..."
tar -czf release/$TGZ_FILE dist/cms.min.js examples/ CHANGELOG.md LICENSE.md README.md INSTALL.apache.md INSTALL.mailinabox.md

if [ $? -eq 0 ]; then
  # archiving was successful
  echo "Successfully created archive"
  ls -lh release/$TGZ_FILE

  if [ -n "$GITHUB_OUTPUT" ]; then
    # If running in a git workflow environment, allow this to relay the generated filename to another process
    echo "filename=$TGZ_FILE" >> $GITHUB_OUTPUT
  fi
else
  # archive was unsuccessful for some reason :(
  echo "Failed to create archive!" >&2
fi
