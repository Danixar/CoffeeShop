<template>
	<div class="home">
		<div class="container">
			<section id="about">
				<h1>Welcome to Coffee Shop!</h1>
				<h3>About Us</h3>
				<p>Coffee Shop. Made for coffee drinkers by someone who only likes tea.</p>
			</section>
		</div>

		<Picture />

		<section id="picture">
			<div class="container">
				<h1>With a long history of providing excellent coffee since 2020</h1>
			</div>
		</section>

		<div class="container">
			<h1>Orders Ready for Pickup</h1>
		</div>

		<Picture />

		<section id="picture2">
			<div class="container">
				<h1>Made from only the finest coffee beans grown in the beautiful climate of North Canada</h1>
			</div>
		</section>

		<div class="container">
			<section>
				<h1>Menu</h1>
			</section>
		</div>

		<footer id="main-footer" class="container">
			<p>Copyright &copy; 2020 Coffee Shop</p>
		</footer>
	</div>
</template>

<script lang="ts">
import Picture from '@/components/Picture.vue';

export default {
	name: 'Home',
	components: {
		Picture,
	},
};
</script>

<style>
#picture {
	background-image: url('~/images/tundra.jpg');
	background-position: center right;
	min-height: 500px;
	margin-bottom: 30px;
	text-align: center;
}
#picture h1 {
	color: black;
	font-size: 50px;
	line-height: 1.6em;
	padding-top: 30px;
}

#picture2 {
	background-image: url('images/tundra2.jpg');
	background-position: center right;
	min-height: 500px;
	margin-bottom: 30px;
	text-align: center;
}
#picture2 h1 {
	color: white;
	font-size: 50px;
	line-height: 1.6em;
	padding-top: 30px;
}
</style>
