import React from 'react';

import { Category, Article } from './types';
import './ProductList.css';
import Pagination from "./Pagination";


var intlNumberFormatValues = ['de-DE', 'currency', 'EUR'];

export var formatter = new Intl.NumberFormat(intlNumberFormatValues[0], {
  style: intlNumberFormatValues[1],
  currency: intlNumberFormatValues[2],
});

type State = {
  categories: Category[];
  input: string;
  page: number;
  totalPages: number;
};

export var ArticleCard = ({ article }: { article: Article }) => {


  // Added Alt to Image
  return (
    <div className={'article'}>
      <img src={article.images[0].path} alt={article.name} />
      <div>{article.name}</div>
      <div>{formatter.format(article.prices.regular.value / 100)}</div>
      <section role="button">Add to cart</section>
    </div>
  )
};

class ArticleList extends React.Component {
  state: State = {
    categories: [],
    input: "", // Search Input Field State.
    page: 1, // Pagination Number.
    totalPages: 10 // Total Number of Items per Page.
  };


  componentDidMount() {
    var xhr = new XMLHttpRequest();

    xhr.open('POST', '/graphql');
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.send(JSON.stringify({
      query: `{
        categories(ids: "156126", locale: de_DE) {
          name
          articleCount
          childrenCategories {
            name
            urlPath
          }
          categoryArticles(first: 50) {
            articles {
              name
              variantName
              prices {
                currency
                regular {
                  value
                }
              }
              images(
                format: WEBP
                maxWidth: 200
                maxHeight: 200
                limit: 1
              ) {
                path
              }
            }
          }
        }
      }`,
    }));

    xhr.onload = () => {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.response);

        this.setState({ categories: response.data.categories });
        console.log(this.state.categories, "####")
      }
    }
  }

  render() {

    /* 
      Set Search Input Field OnChange Function
    **/
    const setSearch = (event: any) => {
      this.setState({ input: event.target.value });
      // console.log(event.target.value);
    }

    /* 
      Added .filter b4 we do the .map, to dynamically filter the rendered list upon typing in the Search Input Field.
      Added .slice after the filter to make pagination work with Search Input field.
      Added Unique Key for each item in our list
   **/

    var articles = this.state.categories.map((category) => {
      return category.categoryArticles.articles
        .filter((val) => {
          if (this.state.input === "") {
            return val;
          } else if (
            val.name.toLowerCase().includes(this.state.input.toLowerCase())
          )
            return val;
          return null;
        })
        .slice((this.state.page - 1) * this.state.totalPages, this.state.page * this.state.totalPages)
        .map((article) => {
          return <ArticleCard article={article} key={Math.random()} />;
        });
    });

    var lengthOfArticlesRendered = this.state.categories.map((category) => {
      return category.categoryArticles.articles
        .filter((val) => {
          if (this.state.input === "") {
            return val;
          } else if (
            val.name.toLowerCase().includes(this.state.input.toLowerCase())
          )
            return val;
          return null;
        })
        .length
    });

    /* 
      Pagination Handling
    **/
    const handlePrevPage = (prevPage: number) => {
      this.setState({ page: prevPage - 1 });
    };

    const handleNextPage = (nextPage: number) => {
      this.setState({ page: nextPage + 1 });
    };


    return (
      <div className={'page'}>
        <div className={'header'}>
          <strong>home24</strong>
          <input value={this.state.input} onChange={(event) => setSearch(event)} placeholder={'Search'} />
        </div>

        {/* Added Unique Key for each item in our list */}
        <div className={'sidebar'}>
          <h3>Kategorien</h3>
          {this.state.categories.length ? (
            <ul>
              {this.state.categories[0].childrenCategories.map(({ name, urlPath }) => {
                return (
                  <li key={Math.random()}>
                    <a href={`/${urlPath}`}>{name}</a>
                  </li>
                );
              })}
            </ul>
          ) : (
            'Loading...'
          )}
        </div>

        <div className={'content'}>
          {this.state.categories.length ? (
            <h1>
              {this.state.categories[0].name}
              <small> ({this.state.categories[0].articleCount})</small>
            </h1>
          ) : (
            'Loading...'
          )}
          <div className={'articles'}>{articles}</div>

          <div className={'pagination'}>
            <Pagination
              totalPages={(Math.round((+lengthOfArticlesRendered) / this.state.totalPages))}
              currentPage={this.state.page}
              handlePrevPage={handlePrevPage}
              handleNextPage={handleNextPage}
            />
          </div>
        </div>
        <div className={'footer'}>
          Alle Preise sind in Euro (€) inkl. gesetzlicher Umsatzsteuer und Versandkosten.
        </div>
      </div>
    );
  }
}

var PLP = () => {
  return <ArticleList />;
};

export default PLP;
