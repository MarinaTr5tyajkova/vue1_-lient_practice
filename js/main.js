// Глобальная шина событий
const eventBus = new Vue()

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b class="error">Please correct the following errors:</b>
                <ul>
                    <li v-for="error in errors" class="error">{{ error }}</li>
                </ul>
            </p>

            <p>
                <label>Name:</label>
                <input v-model="name">
            </p>

            <p>
                <label>Review:</label>
                <textarea v-model="review"></textarea>
            </p>

            <p>
                <label>Rating:</label>
                <select v-model.number="rating">
                    <option disabled value="">Select</option>
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>

            <p>
                <label>Would you recommend this product?</label><br>
                <input type="radio" value="Yes" v-model="recommendation">
                <label>Yes</label>
                <input type="radio" value="No" v-model="recommendation">
                <label>No</label>
            </p>

            <input type="submit" value="Submit">
        </form>
    `,
    data() {
        return {
            name: '',
            review: '',
            rating: null,
            recommendation: '',
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if(!this.name) this.errors.push("Name required");
            if(!this.review) this.errors.push("Review required");
            if(!this.rating) this.errors.push("Rating required");
            if(!this.recommendation) this.errors.push("Recommendation required");

            if(this.errors.length) return;

            eventBus.$emit('review-submitted', {
                name: this.name,
                review: this.review,
                rating: this.rating,
                recommendation: this.recommendation
            });

            this.name = '';
            this.review = '';
            this.rating = null;
            this.recommendation = '';
        }
    }
});

Vue.component('product-details', {
    props: { details: { type: Array, required: true }},
    template: `<ul><li v-for="detail in details">{{ detail }}</li></ul>`
});

Vue.component('product-tabs', {
    props: {
        reviews: Array,
        details: Array,
        shipping: String
    },
    template: `
        <div class="tabs">
            <div class="tabs-header">
                <span v-for="tab in tabs" 
                      :key="tab"
                      class="tab"
                      :class="{ activeTab: selectedTab === tab }"
                      @click="selectedTab = tab">
                    {{ tab }}
                </span>
            </div>
            
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">No reviews yet</p>
                <ul v-else>
                    <li v-for="(review, index) in reviews" :key="index">
                        <p><strong>{{ review.name }}</strong></p>
                        <p>Rating: {{ review.rating }}/5</p>
                        <p>{{ review.review }}</p>
                        <p>Recommendation: {{ review.recommendation }}</p>
                    </li>
                </ul>
            </div>
            
            <div v-show="selectedTab === 'Make a Review'">
                <product-review></product-review>
            </div>
            
            <div v-show="selectedTab === 'Shipping'">
                <p>{{ shipping }}</p>
            </div>
            
            <div v-show="selectedTab === 'Details'">
                <product-details :details="details"></product-details>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews'
        }
    }
});

Vue.component('product', {
    props: { premium: { type: Boolean, required: true }},
    template: `
        <div class="product">
            <div class="product-image">
                <img :src="image" :alt="altText">
            </div>

            <div class="product-info">
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
                
                <p v-if="inStock">In stock</p>
                <p v-else class="out-of-stock">Out of Stock</p>
                
                <span v-if="onSale" class="sale-message">{{ saleMessage }}</span>
                
                <div class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)">
                </div>

                <div>
                    <button @click="addToCart" 
                            :disabled="!inStock" 
                            :class="{ disabledButton: !inStock }">
                        Add to cart
                    </button>
                </div>

                <product-tabs 
                    :reviews="reviews"
                    :shipping="shipping"
                    :details="details">
                </product-tabs>

                <a :href="amazonLink">More products like this</a>
            </div>
        </div>
    `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: 'A pair of warm, fuzzy socks',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            onSale: true,
            amazonLink: 'https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks',
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            const uid = Date.now() + Math.random().toString(36).substr(2, 9);
            this.$emit('add-to-cart', {
                variantId: this.variants[this.selectedVariant].variantId,
                uid: uid
            });
        },
        updateProduct(index) {
            this.selectedVariant = index;
        }
    },
    computed: {
        title() { return this.brand + ' ' + this.product; },
        image() { return this.variants[this.selectedVariant].variantImage; },
        inStock() { return this.variants[this.selectedVariant].variantQuantity > 0; },
        shipping() { return this.premium ? "Free" : "$2.99"; },
        saleMessage() { 
            return this.onSale 
                ? `${this.brand} ${this.product} are on sale!` 
                : '';
        }
    },
    mounted() {
        eventBus.$on('review-submitted', review => {
            this.reviews.push(review)
        })
    }
});

new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(item) { this.cart.push(item); },
        removeFromCart(uid) { this.cart = this.cart.filter(item => item.uid !== uid); }
    }
});