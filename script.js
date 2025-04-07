// JavaScript to toggle the display of the recipe content
function toggleRecipe() {
  var recipeContent = document.getElementById('recipeContent');
  if (recipeContent.style.display === 'none') {
    recipeContent.style.display = 'block';
  } else {
    recipeContent.style.display = 'none';
  }
}
