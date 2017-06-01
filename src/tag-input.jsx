import React from "react";
import classNames from "classnames";

import Autocomplete from "./autocomplete";
import TextInput from "./text-input";

export default class TagInput extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      tagName: !!this.props.inputValue ? this.props.inputValue : "",
      autocomplete: [],
      tags: this.props.tags ? this.props.tags : []
    };
    this.addTag = this.addTag.bind(this);
    this.handelTag = this.handelTag.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }
  componentDidMount() {
    if (this.props.dynamicInputWidth) {
      this.refs.tagInput.style.display = "flex";
      this.refs.tagInput.style.flexWrap = "wrap";
      this.refs.tagInput.lastChild.style.flex = "1 1";
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!!nextProps["tags"]) {
      this.setState({
        tags: nextProps.tags
      });
    }
    if (!!nextProps["autocomplete"]) {
      this.setState({
        autocomplete: nextProps["autocomplete"]
      });
    }
    if (!!nextProps["inputValue"]) {
      this.setState({
        tagName: nextProps["inputValue"]
      });
    }
    this.handelTag({target: {value: nextProps.inputValue}});
  }
  handelTag(e) {
    this.setState({tagName: e.target.value});
    const autocomplete = this.props.autocomplete;

    if (!!autocomplete && !!autocomplete.items && autocomplete.items.length > 0 && e.target.value.length > 0) {
      let searchQuery = e.target.value.toLowerCase();

      const arr = autocomplete.items.filter((el) => {
        if (!!autocomplete.searchKey) {
          if (!el[autocomplete.searchKey]) return false;
          const key = `${el[autocomplete.searchKey]}`.toLowerCase();
          return key.indexOf(searchQuery) !== -1;
        }
        else if (!!autocomplete.searchPath) {
          return autocomplete.searchPath.split(".").reduce((obj, key, i, arr) => {
            if (arr.length - 1 === i) {
              const k = `${obj[key]}`.toLowerCase();
              return k.indexOf(searchQuery) !== -1;
            }
            return obj[key];
          }, el);
        }
        else {
          const key = `${el}`.toLowerCase();
          return key.indexOf(searchQuery) !== -1;
        }
      });

      this.setState({
        autocomplete: arr
      });
    }
    else {
      this.setState({
        autocomplete: []
      });
    }
    if (this.props.onInputChage) this.props.onInputChage(e);
  }
  addTag() {
    const tags = this.state.tagName.length > 0 ? this.state.tags.concat([{name: this.state.tagName}]) : this.state.tags;
    this.setState({
      tagName: "",
      tags
    });
    if (this.props.onAdd) this.props.onAdd({name: this.state.tagName});
    if (this.props.onChange) this.props.onChange(tags);
  }
  onSelect(item) {
    const tags = this.state.tags.concat([item]);

    this.setState({
      autocomplete: this.state.autocomplete.filter((i) => JSON.stringify(i) !== JSON.stringify(item)),
      tagName: "",
      tags
    });

    if (this.props.onAdd) this.props.onAdd(item);
    if (this.props.onChange) this.props.onChange(tags);
    if (this.props.onSelect) this.props.onSelect(item, tags);
  }
  onDelete(tag, actionIndex) {
    let tags = this.state.tags.filter((tag, tagIndex) => {
      if (tagIndex !== actionIndex) {
        return tag;
      }
    });
    this.setState({
      tags
    });
    if (this.props.onDelete) this.props.onDelete(tag, actionIndex, tags);
    if (this.props.onChange) this.props.onChange(tags);
  }
  render() {

    return (
      <div className="rc-input-wrap">
        <ul className={classNames("rc-tag-input", this.props.className)} ref="tagInput">
          {
            this.state.tags.map((tag, index) => {
              let props = {};
              if (tag.href) {
                props["href"] = tag.href;
                props["target"] = "_blank";
              }
              return(
                <li key={`tag-${index}`} className={classNames("tag", tag.className)} style={tag.style}>
                  <a className="name" {...props}>
                    {tag.name ? tag.name : tag}
                  </a>
                  <a onClick={this.onDelete.bind(this, tag, index)} className="btn-close" />
                </li>
              );
            })
          }
          {
            (() => {
              if (!this.props.disableInput) {
                return (
                  <li className="input-area">
                    <TextInput
                      value={this.state.tagName}
                      placeholder={this.props.placeholder}
                      onChange={this.handelTag}
                      clickableKeys={this.props.createTagOnPress}
                      onKeyClick={this.addTag}
                      onFocus={this.props.onFocus}
                      onBlur={this.props.onBlur}
                    />
                  </li>
                );
              }
            })()
          }
          {
            this.props.children
          }
        </ul>
        {
          !!this.props.autocomplete && this.state.autocomplete.length > 0 ? (
            <Autocomplete
              onSelect={this.onSelect}
              className={classNames("rc-tag-input", this.props.autocomplete.className)}
              autocomplete={this.state.autocomplete}
              label={this.props.autocomplete.label}
            />
          ) : null
        }
      </div>
    );
  }
}

TagInput.propTypes = {
  inputValue: React.PropTypes.string,
  tags: React.PropTypes.array,
  autocomplete: React.PropTypes.shape({
    label: React.PropTypes.string,
    searchKey: React.PropTypes.string,
    searchPath: React.PropTypes.string,
    items: React.PropTypes.array
  }),
  disableInput: React.PropTypes.bool,
  createTagOnPress: React.PropTypes.array
};

TagInput.defaultProps = {
  disableInput: false,
  createTagOnPress: [13]
};
