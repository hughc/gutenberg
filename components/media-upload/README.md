MediaUpload
===========

MediaUpload is a React component used to render a button that opens a the WordPress media modal.

## Setup

This is a placeholder component necessary to make it possible to provide an integration with the core blocks that handle media files. By default it renders nothing but it provides a way to have it overridden with the `components.MediaUpload` filter.

```jsx
import { addFilter } from '@wordpress/hooks';
import MediaUpload from './media-upload';

const replaceMediaUpload = () => MediaUpload;

addFilter(
	'components.MediaUpload',
	'core/edit-post/components/media-upload/replaceMediaUpload',
	replaceMediaUpload
);
```

You can check how this component is implemented for the edit post page using `wp.media` module in [here](../../edit-post/hooks/components/media-upload/index.js).

## Usage


```jsx
import { Button, MediaUpload } from '@wordpress/components';

function MyMediaUploader() {
	return (
		<MediaUpload
			onSelect={ ( media ) => console.log( 'selected ' + media.length ) }
			type="image"
			value={ mediaId }
			render={ ( { open } ) => (
				<Button onClick={ open }>
					Open Media Library
				</Button>
			) }
		/>
	);
}
```

## Props

The component accepts the following props. Props not included in this set will be applied to the element wrapping Popover content.

### type

Type of the media to upload/select from the media library (image, video, audio).

- Type: `String`
- Required: No

### multiple

Whether to allow multiple selections or not.

- Type: `Boolean`
- Required: No
- Default: false

### value

Media ID (or media IDs if multiple is true) to be selected by default when opening the media library.

- Type: `Number|Array`
- Required: No

### onSelect

Callback called when the media modal is closed, the selected media are passed as an argument.

- Type: `Func`
- Required: Yes

## render

A callback invoked to render the Button opening the media library.

- Type: `Function`
- Required: Yes

The first argument of the callback is an object containing the following properties:

 - `open`: A function opening the media modal when called