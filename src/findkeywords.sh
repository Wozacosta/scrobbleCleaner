#!/bin/bash

display_usage() { 
	echo "To use with the json output of getTopTracks.js" 
	echo -e "\nUsage:\n$0 file word1 [word2 ...]\n\twords1, word2, etc.: separate word searches on your json file\n" 
} 
# if less than two arguments supplied, display usage 
if [  $# -le 1 ] 
then 
	display_usage
	exit 1
fi 

#http://stackoverflow.com/questions/3427872/whats-the-difference-between-and-in-bash
# [ and [[

# check whether user had supplied -h or --help . If yes display usage 
if [[ ( $@ == "--help") ||  $@ == "-h" ]] 
then 
	display_usage
	exit 0
fi 

FILE=$1

# $1 <--- $2, $2 <--- $3, $3 <--- $4, etc.
# The old $1 disappears, but $0 (the script name) does not change. 
# If you use a large number of positional parameters to a script, shift lets you access those past 10, although {bracket} notation also permits this.
shift

while test ${#} -gt 0
do
	echo -e "All occurences of $1 in $FILE\n"
  cat $FILE | jq . | pcregrep   -iM "([^\{]*?.*?)\K($1)(?:[^\}]*)" | ag --passthru --color $1
  echo -e "\n---------------------------------------\n"
	shift
done


