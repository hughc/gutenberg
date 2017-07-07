/**
 * External dependencies
 */
import { isString, isObject, findIndex, flattenDeep } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from 'i18n';
import { Toolbar } from 'components';

/**
 * Internal dependencies
 */
import './block.scss';
import { registerBlockType, createBlock, query as hpq } from '../../api';
import AlignmentToolbar from '../../alignment-toolbar';
import BlockControls from '../../block-controls';
import Editable from '../../editable';

const { children, node, query } = hpq;

registerBlockType( 'core/quote', {
	title: __( 'Quote' ),
	icon: 'format-quote',
	category: 'common',

	attributes: {
		value: query( 'blockquote > p', node() ),
		citation: children( 'footer' ),
	},

	defaultAttributes: {
		value: [],
	},

	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { content, ...attrs } ) => {
					let value, citation = null;
					if ( content && content.length > 0 ) {
						content = flattenDeep( content );
						const citationBreakPosition = findIndex( content, function( child ) {
							return isObject( child ) && child.type === 'br' && child.props.className === 'citation-break';
						} );

						if ( citationBreakPosition !== -1 ) {
							value = content.slice( 0, citationBreakPosition );
							citation = content.slice( citationBreakPosition + 1 );
						} else {
							value = content;
						}
					}

					return createBlock( 'core/quote', {
						value,
						citation,
						...attrs,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { content } ) => {
					return createBlock( 'core/quote', {
						value: content,
					} );
				},
			},
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/text' ],
				transform: ( { value, citation, ...attrs } ) => {
					// If quote value then the citation becomes the text content.
					if ( ! value || value.length === 0 ) {
						return createBlock( 'core/text', {
							content: citation,
						} );
					}

					const content = value;
					if ( citation && citation.length > 0 ) {
						content.push( <br className="citation-break" key="citationBreak" /> );
						content.push( ...citation );
					}
					return createBlock( 'core/text', {
						content,
						...attrs,
					} );
				},
			},
			{
				type: 'block',
				blocks: [ 'core/heading' ],
				transform: ( { value, citation, ...attrs } ) => {
					const isMultiParagraph = Array.isArray( value ) && isObject( value[ 0 ] ) && value[ 0 ].type === 'p';
					const headingElement = isMultiParagraph ? value[ 0 ] : value;
					const headingContent = isObject( headingElement ) && value[ 0 ].type === 'p'
						? headingElement.props.children
						: headingElement;
					if ( isMultiParagraph || citation ) {
						const heading = createBlock( 'core/heading', {
							content: headingContent,
						} );
						const quote = createBlock( 'core/quote', {
							...attrs,
							citation,
							value: Array.isArray( value ) ? value.slice( 1 ) : '',
						} );

						return [ heading, quote ];
					}
					return createBlock( 'core/heading', {
						content: headingContent,
					} );
				},
			},
		],
	},

	edit( { attributes, setAttributes, focus, setFocus, mergeBlocks, className } ) {
		const { align, value, citation, style = 1 } = attributes;
		const focusedEditable = focus ? focus.editable || 'value' : null;

		return [
			focus && (
				<BlockControls key="controls">
					<Toolbar controls={ [ 1, 2 ].map( ( variation ) => ( {
						icon: 'format-quote',
						title: sprintf( __( 'Quote style %d' ), variation ),
						isActive: Number( style ) === variation,
						onClick() {
							setAttributes( { style: variation } );
						},
						subscript: variation,
					} ) ) } />
					<AlignmentToolbar
						value={ align }
						onChange={ ( nextAlign ) => {
							setAttributes( { align: nextAlign } );
						} }
					/>
				</BlockControls>
			),
			<blockquote
				key="quote"
				className={ `${ className } blocks-quote-style-${ style }` }
			>
				<Editable
					multiline="p"
					value={ value }
					onChange={
						( nextValue ) => setAttributes( {
							value: nextValue,
						} )
					}
					focus={ focusedEditable === 'value' ? focus : null }
					onFocus={ ( props ) => setFocus( { ...props, editable: 'value' } ) }
					onMerge={ mergeBlocks }
					style={ { textAlign: align } }
					placeholder={ __( 'Write quote…' ) }
				/>
				{ ( ( citation && citation.length > 0 ) || !! focus ) && (
					<Editable
						tagName="footer"
						value={ citation }
						placeholder={ __( 'Write citation…' ) }
						onChange={
							( nextCitation ) => setAttributes( {
								citation: nextCitation,
							} )
						}
						focus={ focusedEditable === 'citation' ? focus : null }
						onFocus={ ( props ) => setFocus( { ...props, editable: 'citation' } ) }
					/>
				) }
			</blockquote>,
		];
	},

	save( { attributes } ) {
		const { align, value, citation, style = 1 } = attributes;

		return (
			<blockquote className={ `blocks-quote-style-${ style }` }>
				{ value && value.map( ( paragraph, i ) => (
					<p
						key={ i }
						style={ { textAlign: align ? align : null } }
					>
						{ isString( paragraph ) ? paragraph : paragraph.props.children }
					</p>
				) ) }
				{ citation && citation.length > 0 && (
					<footer>{ citation }</footer>
				) }
			</blockquote>
		);
	},
} );
